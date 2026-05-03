# Toasty To Do

Toasty To Do is a minimalist personal task web app inspired by the simplicity of TeuxDeux, but centered on a backlog-to-focus-session workflow. The product is designed to help a user capture everything they need to do, assign clear priority, and then narrow attention to a small set of tasks for a defined work session.

## Problem

People often collect too many tasks in one place and then struggle to decide what matters now. Traditional task apps frequently mix capture, planning, scheduling, and execution into one noisy interface, which can make deciding what to do feel harder instead of easier.

Toasty To Do exists to reduce that overwhelm. It separates the full backlog from the current focus session so that a user can keep everything they need to remember without losing clarity about what they are actively working on.

## Product Vision

The product should help a user capture everything, assign clear priority, and intentionally narrow attention to a small set of tasks for a session. It should feel calm, fast, and lightweight rather than like a full project-management tool.

The core promise of the app is simple: keep the complete list available, but make the current focus unmistakably small and intentional.

## MVP Scope

### In Scope

- Personal accounts and authenticated access
- Backlog task creation and management
- User-defined task lists for backlog categorization
- Discrete priority levels on tasks
- Focus session creation with optional duration
- Adding and removing backlog tasks from a focus session
- Marking tasks complete
- A minimalist interface optimized for clarity and speed

### Out of Scope

- Collaboration or shared lists
- Projects or tags
- Due dates or calendar views
- Recurring tasks
- Reminders or notifications
- Advanced analytics or reporting
- Team permissions or workspace management

## Primary Workflow

1. User signs in.
2. User captures tasks into the backlog.
3. User assigns each task a priority level.
4. User starts a focus session with an optional duration.
5. User pulls a small set of tasks from the backlog into the focus session.
6. User works from the focus session and marks tasks complete or returns them to the backlog.
7. User ends the session and repeats the process later.

## Core Concepts

### Backlog

The backlog is the user's full personal list of outstanding tasks. It is the place where tasks live by default and serves as the source list for deciding what to work on next.

### Task List

A task list is a lightweight user-defined category inside the backlog. A task may belong to at most one list, and a list may contain many tasks. Lists are meant to help a user visually group related backlog items without turning the product into a project-management tool.

### Priority

Priority is a discrete urgency or importance signal attached to each task. In the MVP, priority is represented as levels rather than manual top-to-bottom ranking of the entire backlog.

### Focus Session

A focus session is a user-owned work session that contains a temporary subset of backlog tasks. It represents the tasks the user intends to actively focus on during a defined period of work, with session duration treated as optional rather than mandatory.

### Task Completion

Completed tasks are retained as task records with a completed state rather than disappearing from the domain model. Completion changes the state of the task, but does not remove it from the system's history or ownership model.

## Domain Model Direction

- One user owns many tasks.
- One user owns many task lists.
- One user owns many focus sessions.
- One task list belongs to one user and contains many tasks.
- One task belongs to zero or one task list.
- A focus session includes references to tasks rather than duplicated task records.
- Tasks remain canonical in the backlog and overall domain model even when included in a focus session.
- Priority is represented as levels, not manual top-to-bottom ranking.

This direction is intended to keep the write path clear: tasks are the core unit of work, and focus sessions organize active attention around those tasks without creating parallel task systems.

## Product Principles

- Minimize visual and interaction overhead.
- Keep task capture fast and low-friction.
- Make "what I could do" distinct from "what I am doing now."
- Favor clarity and restraint over feature breadth.
- Keep organization lightweight and explicit through lists only; do not expand into projects or tags.

The interface should support calm decision-making. Every product choice should reinforce the difference between storing work and actively focusing on work.

## Architecture Direction

- Frontend: React + TypeScript with Vite
- UI component approach: prefer official `shadcn/ui` components with default styling, and create custom components only when no suitable `shadcn/ui` option exists
- Persistence: SQLite
- Data and schema layer: Drizzle
- Authentication: Better Auth
- Architectural rule: centralize business rules and keep UI and components thin

The architecture should support a simple, maintainable product where domain behavior is defined in clear application logic rather than scattered across interface code.

## Constraints and Non-Goals

Toasty To Do is a personal productivity tool first, not a collaborative workspace. The MVP should stay intentionally narrow and avoid scope creep into a general task-management suite.

Dates, tags, and projects should not be implied as near-term requirements anywhere in the initial implementation direction. If those ideas become necessary later, they should be introduced deliberately as explicit product expansions rather than assumed defaults.

## Success Criteria

- A user can authenticate and access only their own task data.
- A user can create, edit, prioritize, complete, and review backlog tasks.
- A user can create their own backlog lists and assign tasks into them.
- A user can create a focus session and select backlog tasks into it.
- The product supports a clear backlog-to-focus workflow without requiring extra organizational features.

## Future Expansion

The following ideas are explicitly deferred beyond the MVP:

- Due dates
- Tags or projects beyond single-list categorization
- Recurring tasks
- Shared or collaborative lists
- Reporting and richer history views

## Decision Summary

- Toasty To Do is a personal app, not a team product.
- Priority is represented through levels, not ordered ranking.
- The product uses focus sessions, not just a static daily agenda.
- The MVP is narrow by design and should remain focused on backlog-to-session workflow, with only lightweight list-based backlog categorization.
