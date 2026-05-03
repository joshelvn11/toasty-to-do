# Technical Notes

## Authentication

- Better Auth is mounted at `/api/auth/*` from the Hono server in [server/app.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/app.ts:1).
- Email/password auth is the only enabled sign-in method in the MVP.
- Server code resolves the current session with `auth.api.getSession({ headers })`, wrapped by helpers in [server/auth.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/auth.ts:1).
- `requireSession(...)` now throws a typed unauthorized error so authenticated API routes and global error handling can consistently return `401`.
- The Node server applies pending Drizzle migrations during startup through [server/db/migrate.ts](/Users/JoshBeaver/Documents/PERSONAL/TOASTY%20TO%20DO/toasty-to-do/server/db/migrate.ts:1), which keeps local development databases aligned with the checked-in schema before requests hit the API.
- In containerized production, `APP_URL` and `BETTER_AUTH_URL` should both point at the same public origin because the compiled Hono server serves the frontend and API from one process.

## Schema Ownership and Domain Tables

- Better Auth tables remain defined in Drizzle under [server/db/schema/index.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/db/schema/index.ts:1).
- The Better Auth `user` table is still the canonical application user record. No duplicate app-level users table was introduced.
- Phase 3 adds three application tables:
- Phase 9 adds `task_list` for user-owned backlog categories and extends `task` with nullable `listId`.
  - `task` for canonical backlog task records
  - `task_list` for lightweight backlog grouping
  - `focus_session` for user-owned work sessions
  - `focus_session_task` for session-to-task membership
- `task.priority` is constrained to the MVP enum `low | medium | high` at both the service layer and database layer.
- `task.listId` is nullable and uses `ON DELETE SET NULL` so deleting a list unassigns tasks instead of deleting them.
- All new tables cascade on delete from their owning parent records so user deletion removes dependent tasks, sessions, and membership rows.

## Task Domain Write Path

- Task domain code lives under `server/tasks/`.
- [server/tasks/task-repository.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-repository.ts:1) is the only layer that talks directly to Drizzle for task operations.
- [server/tasks/task-service.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-service.ts:1) owns task validation, default priority assignment, title trimming, list ownership checks, and not-found behavior.
- Task DTO mapping is centralized in [server/tasks/task-mappers.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-mappers.ts:1) so the API does not expose internal columns such as `userId`.
- Task DTOs now embed nullable list summary data so backlog and focus-session UIs can render list context without extra joins on the client.

## Task List Domain Rules

- Task-list domain code lives under [server/task-lists/](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/task-lists).
- [server/task-lists/task-list-repository.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/task-lists/task-list-repository.ts:1) is the only layer that talks directly to Drizzle for task-list operations.
- [server/task-lists/task-list-service.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/task-lists/task-list-service.ts:1) owns list-name validation, ownership checks, and create/rename/delete behavior.
- Deleting a list intentionally preserves its tasks and relies on the database foreign-key behavior to clear `task.listId`.

## Task API Boundary

- Authenticated task routes are mounted at `/api/tasks` from [server/tasks/task-routes.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-routes.ts:1).
- Supported routes are:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PATCH /api/tasks/:taskId`
  - `POST /api/tasks/:taskId/complete`
  - `POST /api/tasks/:taskId/reopen`
- Task list filtering supports `open`, `completed`, and `all`, defaulting to `open`.
- Task create/update requests now also accept optional `listId`, with `null` explicitly unassigning a task.
- Invalid input returns `400`, missing auth returns `401`, and missing or foreign task ids return `404` without revealing ownership details.

## Task List API Boundary

- Authenticated list routes are mounted at `/api/lists` from [server/task-lists/task-list-routes.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/task-lists/task-list-routes.ts:1).
- Supported routes are:
  - `GET /api/lists`
  - `POST /api/lists`
  - `PATCH /api/lists/:listId`
  - `DELETE /api/lists/:listId`
- List responses are ordered by creation time so the backlog can render stable grouped sections with `Unassigned` first and user-created lists after.

## Focus Session Domain Rules

- Focus-session domain code lives under [server/focus-sessions/](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/focus-sessions).
- [server/focus-sessions/focus-session-repository.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/focus-sessions/focus-session-repository.ts:1) owns all Drizzle access for sessions and membership rows.
- [server/focus-sessions/focus-session-service.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/focus-sessions/focus-session-service.ts:1) defines the MVP focus rules:
  - at most one active focus session per user
  - `durationMinutes` is optional but, when present, must be a positive whole number
  - only active sessions can accept task adds, removals, completions, or ending
  - completed tasks cannot be added into a focus session
- Focus-session membership continues to reference canonical task records through `focus_session_task`; completing a task from a focus session still uses the central task completion path rather than creating a session-only task copy.
- Session DTOs include nested task projections plus `addedToSessionAt`, ordered by membership creation time so the interface can preserve the sequence in which work was pulled into focus.

## Focus Session API Boundary

- Authenticated focus-session routes are mounted at `/api/focus-sessions` from [server/focus-sessions/focus-session-routes.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/focus-sessions/focus-session-routes.ts:1).
- Supported routes are:
  - `GET /api/focus-sessions/current`
  - `POST /api/focus-sessions`
  - `POST /api/focus-sessions/:sessionId/end`
  - `POST /api/focus-sessions/:sessionId/tasks`
  - `DELETE /api/focus-sessions/:sessionId/tasks/:taskId`
  - `POST /api/focus-sessions/:sessionId/tasks/:taskId/complete`
- Focus-session conflicts such as starting a second active session, re-adding the same task, or mutating an ended session return `409` through the shared server error handler.

## Backlog and Focus Client Flow

- The authenticated app workflow now lives in [src/routes/app-shell-page.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/routes/app-shell-page.tsx:1).
- Shared client-side JSON fetching lives in [src/lib/api-client.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/lib/api-client.ts:1) so task and focus-session modules follow the same request/error pattern.
- `requestJson(...)` now throws a typed `ApiError` carrying `status` plus message text, and dispatches a shared unauthorized event on `401` so protected screens can redirect back to sign-in instead of surfacing a vague generic error.
- Task requests remain centralized in [src/lib/task-api.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/lib/task-api.ts:1).
- Task-list requests are centralized in [src/lib/task-list-api.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/lib/task-list-api.ts:1).
- Focus-session requests are centralized in [src/lib/focus-session-api.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/lib/focus-session-api.ts:1).
- [src/hooks/use-backlog.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/hooks/use-backlog.ts:1) continues to own the authenticated backlog read and mutation flow:
  - loading the current filter view
  - loading task lists alongside tasks
  - switching among `open`, `completed`, and `all`
  - create, update, complete, and reopen task mutations
  - create, rename, and delete list mutations
  - reloading after successful mutations so the UI stays aligned with the server write path
- [src/hooks/use-focus-session.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/hooks/use-focus-session.ts:1) owns the active focus-session client flow:
  - loading the current active session
  - starting and ending a session
  - adding, removing, and completing focus tasks
  - tracking session-specific loading, pending-action, and mutation-error state
- The protected route now keeps orchestration in [src/routes/app-shell-page.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/routes/app-shell-page.tsx:1) while pushing most presentation into [src/components/backlog-panel.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/backlog-panel.tsx:1) and [src/components/focus-session-panel.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/focus-session-panel.tsx:1).
- [src/components/backlog-panel.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/backlog-panel.tsx:1) now groups the currently filtered backlog into `Unassigned` plus user-created list sections while keeping task actions unchanged within each group.
- When a backlog mutation changes a task that is currently in focus, the route triggers a focus-session reload so the focus panel stays consistent with the canonical task record.

## UI System and Styling

- Phase 7 adopts `shadcn/ui` as the default component system for the app, initialized through the official CLI with `components.json` and generated primitives under [src/components/ui/](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/ui).
- Tailwind CSS v4 is wired into Vite through [vite.config.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/vite.config.ts:1), with the shared `@/*` alias configured in TypeScript and Vite for generated component imports.
- Global styling is now intentionally thin in [src/index.css](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/index.css:1): it defines the shadcn/Tailwind theme tokens, page background, and base typography while screen-level layout and component styling live primarily in component class names.
- App-specific composition stays outside the generated primitives. Shared pieces such as [src/components/task-priority-badge.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/task-priority-badge.tsx:1) wrap generated primitives rather than forking them.

## Installable PWA Layer

- The frontend now uses `vite-plugin-pwa` in [vite.config.ts](/Users/JoshBeaver/Documents/PERSONAL/TOASTY%20TO%20DO/toasty-to-do/vite.config.ts:1) with the `generateSW` strategy and automatic service-worker updates.
- The manifest config exposes `Toasty To Do` as a standalone installable app, with standard plus maskable PNG icons served from `public/`.
- Production builds register the service worker from [src/main.tsx](/Users/JoshBeaver/Documents/PERSONAL/TOASTY%20TO%20DO/toasty-to-do/src/main.tsx:1); development keeps it disabled to avoid local debugging friction.
- Workbox caching remains intentionally conservative: built frontend assets are precached, `/api/*` is excluded from SPA fallback handling, and there is no API response caching or offline task-sync behavior in the MVP.
- This means installability improves the shell experience only. Authenticated data still depends on the live backend and current Better Auth cookies/session flow.

## Testing

- Vitest is configured in [vitest.config.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/vitest.config.ts:1) with a jsdom environment and shared cleanup in [src/test/setup.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/test/setup.ts:1).
- Client coverage focuses on the authenticated workflow and focus-panel edge cases:
  - [src/routes/app-shell-page.test.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/routes/app-shell-page.test.tsx:1) covers list creation, list-grouped backlog rendering, list-aware task creation, edit validation, add-to-focus, focus completion, and empty backlog rendering.
  - [src/components/focus-session-panel.test.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/focus-session-panel.test.tsx:1) covers duration validation plus retryable load/empty states.
- Server coverage focuses on domain guardrails rather than DB integration:
  - [server/tasks/task-service.test.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-service.test.ts:1) covers blank titles, invalid status, missing-task updates, and rejecting foreign or missing list assignment.
  - [server/task-lists/task-list-service.test.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/task-lists/task-list-service.test.ts:1) covers blank list names, missing-list rename attempts, and delete delegation.
  - [server/focus-sessions/focus-session-service.test.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/focus-sessions/focus-session-service.test.ts:1) covers second-session conflicts, completed-task rejection, ended-session mutation blocking, and missing task/session access.

## Route Boundaries

- `/`, `/sign-in`, and `/sign-up` are public-only routes.
- `/app` is the protected authenticated backlog shell.
- Unknown routes redirect to `/`, which then redirects authenticated users into `/app`.
- Shared request parsing and authenticated user resolution now live in [server/lib/route-utils.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/lib/route-utils.ts:1) so the task and focus-session route modules can stay thin and consistent.

## Production Build and Container Shape

- `npm run build` now produces a production artifact split into `dist/client` for the Vite frontend and `dist/server` for the compiled Hono server.
- The compiled server serves static frontend assets plus SPA fallback routing through [server/lib/static-app.ts](/Users/JoshBeaver/Documents/PERSONAL/TOASTY%20TO%20DO/toasty-to-do/server/lib/static-app.ts:1), so Docker deployment can run the entire app in a single container.
- The production `Dockerfile` uses a multi-stage Node 22 build, prunes dev dependencies after compilation, and runs the app with `npm run start`.
- [docker-compose.yml](/Users/JoshBeaver/Documents/PERSONAL/TOASTY%20TO%20DO/toasty-to-do/docker-compose.yml:1) mounts `/app/data` as a persistent volume so the SQLite database survives container restarts.
- Because the app is deployed from one origin, the generated manifest and service worker can be served directly by the same Hono process without extra reverse-proxy routing.
