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

## Route Boundaries

- `/`, `/sign-in`, and `/sign-up` are public-only routes.
- `/app` is the protected authenticated shell.
- Unknown routes redirect to `/`, which then redirects authenticated users into `/app`.
