# Agent Guide

This file is the primary working guide for AI agents contributing to this repository. It ensures continuity of knowledge, consistent execution, and clear decision-making across agents over time.

---

## Core Principle

This repository is guided by two mandatory documents:

- `BRIEF.md` → defines **what** we are building and **why**
- `IMPLEMENTATION_PLAN.md` → defines **how** we are building it and **in what order**

All work must align with these documents.

---

## Project Context

### `BRIEF.md` (Source of Truth: Intent + Architecture)

The brief defines:

- Product goals and scope
- Core concepts and terminology
- Data model and relationships
- Architectural direction
- Explicit constraints and non-goals

Rules:

- Treat the brief as the **single source of truth for decisions**
- Do not introduce patterns, features, or structures that conflict with the brief
- If implementation reveals a better approach:
  - Update the brief first
  - Then implement against the updated brief

---

### `IMPLEMENTATION_PLAN.md` (Source of Truth: Execution)

The implementation plan defines:

- Phases of work
- Task breakdowns
- Execution order
- Dependencies between tasks

Rules:

- Follow the plan in sequence unless there is a strong reason not to
- Prefer completing tasks fully before moving on
- Keep tasks small, testable, and clearly scoped

Agents are expected to:

- Mark completed tasks
- Refine unclear tasks
- Add missing tasks when discovered
- Remove obsolete tasks

If the plan changes:

- Preserve the intent of the brief
- Keep sequencing logical and minimal
- Document why the change was made

---

## Architecture Guidelines

Unless explicitly overridden in the brief:

- Keep business logic centralized
- Avoid duplication across interfaces (UI, APIs, tools)
- Prefer shared modules/packages for reusable logic
- Keep interfaces thin (controllers, routes, handlers)

General rules:

- One clear write path per domain concept
- Consistent data access patterns
- Avoid speculative abstractions
- Prefer simple, composable solutions

---

## Data and Domain Guardrails

Unless the brief is updated:

- Maintain consistent data modeling across all layers
- Avoid implicit behavior—make rules explicit
- Keep validation centralized
- Respect defined relationships and constraints

When making changes:

- Update all dependent systems (services, APIs, seeds, tests)
- Handle migrations or compatibility concerns
- Document behavioral changes

---

## Agent Priorities

When implementing:

1. Respect the brief
2. Follow and maintain the implementation plan
3. Keep logic centralized and consistent
4. Reduce complexity and future churn
5. Improve clarity for the next agent

---

## Documentation Hygiene

Documentation must remain in sync with the codebase at all times.

### Documentation Files and Intent

#### Root `README.md`

- High-level overview and setup
- Update when:
  - Setup changes
  - Project structure changes
  - Major architecture shifts occur

---

#### Local `README.md` (per module/app)

- Explains local responsibilities and usage
- Update when:
  - Commands or entry points change
  - Responsibilities shift

---

#### Root `TECHNICAL.md`

- Repository-wide implementation details
- Update when:
  - Shared logic changes
  - Data flow changes
  - Cross-cutting concerns evolve

---

#### Local `TECHNICAL.md`

- Internal mechanics of a module
- Update when:
  - Internal behavior changes
  - New edge cases or assumptions are introduced

---

#### `CHANGELOG.md`

- Human-readable record of meaningful changes
- Update when:
  - Features, fixes, or behavior changes are completed

---

#### `.env.example`

- Documents required environment variables
- Update when:
  - Variables are added, removed, or renamed

---

#### `API.md` (or equivalent)

- Documents exposed interfaces (HTTP, RPC, tools)
- Update when:
  - Contracts or schemas change

---

#### `TODO.md`

- Tracks deferred work and known issues
- Use tags:
  - `[TECH DEBT]`
  - `[FEATURE]`
  - `[BUG]`
  - `[PERFORMANCE]`
  - `[SECURITY]`

---

## Documentation Granularity

- Formatting-only → no update required
- Minor refactor → update `TECHNICAL.md` if behavior changed
- New feature → update `README.md`, `TECHNICAL.md`, `CHANGELOG.md`
- Breaking change → update all affected docs

When unsure, document in `TECHNICAL.md`.

---

## Required Documentation Check

After any change, evaluate:

- Root `README.md` → changed? (yes/no)
- Root `TECHNICAL.md` → changed? (yes/no)
- Local `README.md` → changed? (yes/no)
- Local `TECHNICAL.md` → changed? (yes/no)
- `CHANGELOG.md` → changed? (yes/no)
- `.env.example` → changed? (yes/no)
- `API.md` → changed? (yes/no)
- `TODO.md` → changed? (yes/no)
- `BRIEF.md` → changed? (yes/no)
- `IMPLEMENTATION_PLAN.md` → changed? (yes/no)

If yes, update in the same task when practical.

Do not skip this evaluation.

---

## Change Impact Awareness

Before finalizing changes, consider:

- Downstream consumers
- Upstream dependencies
- Shared types and schemas
- Environment configuration
- Data compatibility
- Interface contracts
- Migration requirements

If impacted:

- Update implementation
- Update documentation
- Update the plan if sequencing is affected

---

## Working With the Brief

Update the brief when:

- A core data model changes
- A relationship or constraint changes
- A new architectural pattern is introduced
- A previous decision is no longer valid

Do not:

- Drift from the brief silently
- Implement conflicting patterns without updating it

The brief should always reflect the current intended system.

---

## Working With the Implementation Plan

Update the plan when:

- Tasks are completed → mark them done
- Tasks are unclear → clarify them
- New work is discovered → add tasks
- Work becomes irrelevant → remove tasks
- Sequencing needs improvement → reorder tasks

The plan should always reflect the **next correct steps**.

---

## Execution Expectations

When working:

- Read the brief and plan before making changes
- Follow the plan unless there is a clear issue
- Prefer completing tasks end-to-end
- Keep changes coherent and minimal
- Avoid partial implementations

If a decision is:

- **High impact / architectural** → pause and clarify
- **Low risk** → decide and document

---

## Continuity Principle

This repository is designed for **multi-agent continuity**.

Every change should:

- Preserve context
- Reduce ambiguity
- Make decisions traceable
- Make the next step obvious

If a future agent cannot quickly understand:

- What was built
- Why it was built
- What to do next

Then the documentation is incomplete.
