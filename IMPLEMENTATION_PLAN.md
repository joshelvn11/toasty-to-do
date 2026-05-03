# Toasty To Do Implementation Plan

This plan translates `BRIEF.md` into a sequence of manageable implementation phases. Each phase is intentionally scoped so that one AI agent should be able to complete it in a single focused session without needing to hold the entire project in context at once.

The plan should be executed in order unless a later phase becomes blocked by a missing prerequisite that should be pulled forward. When a phase is completed, mark it done and update this plan if new tasks are discovered.

## Execution Rules

- Complete phases end-to-end before moving on where practical.
- Keep business logic centralized and UI code thin.
- Keep the MVP narrow and aligned with `BRIEF.md`.
- Update any impacted documentation in the same phase when practical.
- Do not expand scope into dates, tags, projects, collaboration, or notifications.

## Phase 1: Foundation and App Skeleton

- [x] Replace the Vite starter app with a minimal application shell aligned with the product direction.
- [x] Install and configure the core stack needed for the MVP: React, TypeScript, Vite app structure, SQLite integration approach, Drizzle, and Better Auth.
- [x] Establish a clear project structure for UI, domain logic, data access, and auth-related code.
- [x] Create the base layout and route structure for authenticated app flow versus unauthenticated entry flow.
- [x] Add baseline developer documentation for running the app locally if setup changes from the starter README.

Done when:

- The starter demo UI is gone.
- The repo has an intentional folder structure for the app.
- The project can run locally with the chosen stack wired in at a basic level.

## Phase 2: Authentication and User Ownership

- [x] Configure Better Auth for personal account access.
- [x] Implement sign-up, sign-in, and sign-out flows appropriate for the MVP.
- [x] Add session handling and route protection for authenticated areas.
- [x] Ensure the app has a consistent notion of the current user that can be used by data and UI layers.
- [x] Add a simple authenticated landing state for a newly signed-in user.

Done when:

- A user can authenticate successfully.
- Unauthenticated users are blocked from app-only screens.
- Authenticated screens can resolve the current user identity cleanly.

## Phase 3: Database Schema and Task Domain

- [x] Define the initial Drizzle schema for users, tasks, focus sessions, and session-task membership.
- [x] Create the first migration set for the MVP schema.
- [x] Implement the central task domain/data layer for creating, reading, updating, completing, and listing tasks for a single user.
- [x] Define the discrete priority model used by the MVP.
- [x] Ensure task ownership and access rules are enforced at the data layer.
- [x] Build Phase 3 on top of the existing Better Auth `user` table rather than introducing a duplicate application users table.

Done when:

- The schema supports the backlog and focus-session model from `BRIEF.md`.
- Task operations are available through a single clear write path.
- User-scoped task access is enforced consistently.
- Authenticated `/api/tasks` routes are available for the Phase 4 backlog UI.

## Phase 4: Backlog Experience

- [x] Build the backlog screen for authenticated users.
- [x] Implement task capture, task editing, priority changes, completion, and backlog listing.
- [x] Design the backlog UI to stay minimalist while still exposing the core task actions.
- [x] Add empty, loading, and basic error states for backlog interactions.
- [x] Verify the backlog experience supports the primary capture-and-prioritize workflow without extra organizational features.

Done when:

- A signed-in user can fully manage backlog tasks from the UI.
- Priority levels are visible and editable.
- The backlog stands on its own as the user's complete task list.

## Phase 5: Focus Session Domain and Flows

- [x] Implement the focus session data and service layer using task references rather than duplicated task records.
- [x] Support creating a focus session with optional duration.
- [x] Support adding backlog tasks into a focus session and removing them again.
- [x] Support completing tasks from within a focus session without breaking backlog continuity.
- [x] Define the MVP rules for active versus ended sessions if that distinction is needed by the interface.

Done when:

- Focus sessions can be created and persisted.
- Tasks can move into and out of a focus session without creating parallel task copies.
- Session interactions preserve the task model defined in the brief.

## Phase 6: Focus Session Interface and Workflow Integration

- [x] Build the focus session UI and connect it to backlog data.
- [x] Make the distinction between backlog and current focus visually obvious.
- [x] Allow a user to start a session, view session contents, act on tasks, and end the session.
- [x] Ensure the end-to-end workflow works cleanly: capture task, prioritize task, add to session, complete or return it, repeat.
- [x] Add empty, loading, and error states specific to the focus workflow.

Done when:

- A user can execute the full backlog-to-focus-session workflow from the interface.
- The UI clearly communicates “all tasks” versus “current focus.”
- The core product promise is demonstrable in one run-through.

## Phase 7: MVP Polish, Validation, and Guardrails

- [x] Adopt `shadcn/ui` as the default component system for the app UI and keep styling close to the library defaults so the interface stays clean, simple, and minimal.
- [x] Retrofit the existing backlog and focus-session screens to use suitable `shadcn/ui` components and primitives wherever they fit the MVP.
- [x] Install any needed `shadcn/ui` components through the official `shadcn` CLI rather than copying or hand-rolling component implementations.
- [x] Create custom UI components only when no suitable `shadcn/ui` component or primitive exists for the specific need.
- [x] Review and simplify any rough interaction points in backlog and focus flows so capture stays low-friction and the distinction between backlog and current focus remains visually obvious.
- [x] Add validation and defensive handling for obvious edge cases such as empty task titles, invalid session input, and unauthorized access attempts.
- [x] Add or improve automated tests for the highest-value domain and UI workflows.
- [x] Verify the app behavior remains within the MVP boundaries defined in `BRIEF.md`.

Done when:

- The product feels coherent as an MVP rather than a collection of disconnected screens.
- The backlog and focus-session UI use a consistent, default-styled `shadcn/ui` component approach, with custom components added only where the library is not a suitable fit.
- Core failure cases are handled sensibly.
- The most important user flows have reliable test coverage.

## Phase 8: Documentation and Release Readiness

- [ ] Update root documentation to reflect the actual app setup and architecture.
- [ ] Create or update technical documentation for auth flow, schema direction, and major domain decisions if those docs now exist.
- [ ] Add a changelog entry summarizing the MVP foundation if a changelog is introduced.
- [ ] Review `.env.example` and document any required environment variables.
- [x] Add containerized deployment support with a production Dockerfile and Docker Compose setup suitable for single-service platforms.
- [x] Add a minimal installable PWA configuration with manifest, service worker registration, and install icons while keeping live API behavior network-dependent.
- [ ] Perform a final documentation impact review against the repository rules in `AGENTS.md`.

Done when:

- A new contributor can understand what was built and how to run it.
- The repository documentation matches the implemented system.
- The project is ready for the next iteration without hidden setup knowledge.

## Phase 9: Backlog Task Lists

- [x] Update `BRIEF.md` to explicitly allow lightweight user-defined task lists as backlog categories while keeping tags, projects, and collaboration out of scope.
- [x] Add a `task_list` table plus nullable `task.listId` support so one task can belong to zero or one user-owned list.
- [x] Extend the task service and API to validate list ownership and return task list metadata alongside tasks.
- [x] Add authenticated `/api/lists` endpoints for creating, renaming, listing, and deleting user-owned lists.
- [x] Expand the authenticated backlog UI so users can create lists, assign tasks to lists, and manage list names.
- [x] Change the backlog presentation to group the filtered task set by list, always including an `Unassigned` section first.
- [x] Add or update automated tests covering list validation, grouped backlog rendering, and list-aware task mutations.
- [x] Update affected documentation and changelog entries for the new backlog categorization feature.

Done when:

- A signed-in user can create, rename, and delete their own lists.
- A task can be assigned to one list or left unassigned without affecting focus-session continuity.
- The main backlog screen renders grouped sections for `Unassigned` and each user-created list.

## Phase Dependencies

- Phase 1 must be completed before all later phases.
- Phase 2 depends on Phase 1.
- Phase 3 depends on Phases 1 and 2.
- Phase 4 depends on Phase 3.
- Phase 5 depends on Phases 3 and 4.
- Phase 6 depends on Phases 4 and 5.
- Phase 7 depends on Phases 4 through 6.
- Phase 8 depends on all prior phases.

## MVP Completion Check

The MVP is complete when all phases above are done and the following are true:

- A user can authenticate and access only their own data.
- A user can manage a backlog of tasks with discrete priority levels.
- A user can create a focus session with optional duration.
- A user can pull backlog tasks into that session and work from it.
- The app clearly separates backlog from current focus.
- The implementation remains narrow and does not include deferred features from `BRIEF.md`.
