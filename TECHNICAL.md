# Technical Notes

## Authentication

- Better Auth is mounted at `/api/auth/*` from the Hono server in [server/app.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/app.ts:1).
- Email/password auth is the only enabled sign-in method in the MVP.
- Server code resolves the current session with `auth.api.getSession({ headers })`, wrapped by helpers in [server/auth.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/auth.ts:1).
- `requireSession(...)` now throws a typed unauthorized error so authenticated API routes and global error handling can consistently return `401`.

## Schema Ownership and Domain Tables

- Better Auth tables remain defined in Drizzle under [server/db/schema/index.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/db/schema/index.ts:1).
- The Better Auth `user` table is still the canonical application user record. No duplicate app-level users table was introduced.
- Phase 3 adds three application tables:
  - `task` for canonical backlog task records
  - `focus_session` for user-owned work sessions
  - `focus_session_task` for session-to-task membership
- `task.priority` is constrained to the MVP enum `low | medium | high` at both the service layer and database layer.
- All new tables cascade on delete from their owning parent records so user deletion removes dependent tasks, sessions, and membership rows.

## Task Domain Write Path

- Task domain code lives under `server/tasks/`.
- [server/tasks/task-repository.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-repository.ts:1) is the only layer that talks directly to Drizzle for task operations.
- [server/tasks/task-service.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-service.ts:1) owns task validation, default priority assignment, title trimming, and not-found behavior.
- Task DTO mapping is centralized in [server/tasks/task-mappers.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-mappers.ts:1) so the API does not expose internal columns such as `userId`.

## Task API Boundary

- Authenticated task routes are mounted at `/api/tasks` from [server/tasks/task-routes.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/tasks/task-routes.ts:1).
- Supported routes are:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PATCH /api/tasks/:taskId`
  - `POST /api/tasks/:taskId/complete`
  - `POST /api/tasks/:taskId/reopen`
- Task list filtering supports `open`, `completed`, and `all`, defaulting to `open`.
- Invalid input returns `400`, missing auth returns `401`, and missing or foreign task ids return `404` without revealing ownership details.

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
- Task requests remain centralized in [src/lib/task-api.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/lib/task-api.ts:1).
- Focus-session requests are centralized in [src/lib/focus-session-api.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/lib/focus-session-api.ts:1).
- [src/hooks/use-backlog.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/hooks/use-backlog.ts:1) continues to own the authenticated backlog read and mutation flow:
  - loading the current filter view
  - switching among `open`, `completed`, and `all`
  - create, update, complete, and reopen mutations
  - reloading after successful mutations so the UI stays aligned with the server write path
- [src/hooks/use-focus-session.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/hooks/use-focus-session.ts:1) owns the active focus-session client flow:
  - loading the current active session
  - starting and ending a session
  - adding, removing, and completing focus tasks
  - tracking session-specific loading, pending-action, and mutation-error state
- The focus panel presentation lives in [src/components/focus-session-panel.tsx](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/focus-session-panel.tsx:1) so the route can orchestrate backlog and session state without burying all focus UI details in one file.
- When a backlog mutation changes a task that is currently in focus, the route triggers a focus-session reload so the focus panel stays consistent with the canonical task record.

## Route Boundaries

- `/`, `/sign-in`, and `/sign-up` are public-only routes.
- `/app` is the protected authenticated backlog shell.
- Unknown routes redirect to `/`, which then redirects authenticated users into `/app`.
- Shared request parsing and authenticated user resolution now live in [server/lib/route-utils.ts](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/lib/route-utils.ts:1) so the task and focus-session route modules can stay thin and consistent.
