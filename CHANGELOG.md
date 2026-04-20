# Changelog

## Unreleased

- Added Phase 3 database support for `task`, `focus_session`, and `focus_session_task` tables on top of the Better Auth `user` table.
- Added a centralized task repository and service layer for create, list, update, complete, and reopen operations.
- Added authenticated `/api/tasks` endpoints with user-scoped ownership enforcement and input validation.
- Added the Phase 4 authenticated backlog UI at `/app`, including task capture, filtering, inline editing, and complete/reopen actions backed by the existing task API.
- Added a client-side task API module and backlog state hook to keep authenticated task reads and mutations centralized on the frontend.
- Added a Phase 5 focus-session backend module with explicit active-session rules, optional duration validation, and session task membership management built on canonical task records.
- Added authenticated `/api/focus-sessions` endpoints for creating, ending, inspecting, and mutating focus sessions without duplicating tasks.
- Added shared route utilities and `409` conflict handling so authenticated task and focus-session routes can stay thin and consistent.
