# Changelog

## Unreleased

- Added user-owned backlog task lists with authenticated `/api/lists` endpoints for create, rename, list, and delete operations.
- Added nullable task-to-list assignment through the central task write path, including ownership validation and list metadata on task DTOs.
- Added grouped backlog rendering so `/app` shows the filtered task set under `Unassigned` plus each user-created list while preserving existing task and focus actions.
- Added automated coverage for task-list validation, list-aware task updates, and the grouped backlog UI.
- Added Phase 3 database support for `task`, `focus_session`, and `focus_session_task` tables on top of the Better Auth `user` table.
- Added a centralized task repository and service layer for create, list, update, complete, and reopen operations.
- Added authenticated `/api/tasks` endpoints with user-scoped ownership enforcement and input validation.
- Added the Phase 4 authenticated backlog UI at `/app`, including task capture, filtering, inline editing, and complete/reopen actions backed by the existing task API.
- Added a client-side task API module and backlog state hook to keep authenticated task reads and mutations centralized on the frontend.
- Added a Phase 5 focus-session backend module with explicit active-session rules, optional duration validation, and session task membership management built on canonical task records.
- Added authenticated `/api/focus-sessions` endpoints for creating, ending, inspecting, and mutating focus sessions without duplicating tasks.
- Added shared route utilities and `409` conflict handling so authenticated task and focus-session routes can stay thin and consistent.
- Added a Phase 6 focus-session interface to the protected app shell so users can start a session, pull backlog tasks into focus, complete or return them, and end the session from one screen.
- Added a client-side focus-session API module, state hook, and dedicated focus panel component to keep the backlog and active-session UI synchronized through the existing server write path.
- Added the Phase 7 `shadcn/ui` + Tailwind UI baseline across the app, including generated primitives, shared composed panels, and a simplified token-driven global stylesheet.
- Added typed client API errors with a predictable `401` redirect path for protected routes, keeping validation and auth-failure handling clearer in backlog and focus flows.
- Added Vitest coverage for core task/focus service guardrails and the highest-value authenticated UI workflows.
