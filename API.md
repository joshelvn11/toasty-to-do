# API Reference

## Authentication

- Better Auth is mounted at `/api/auth/*`.
- Task and focus-session endpoints below require an authenticated Better Auth session.
- Unauthenticated requests receive `401`.

## Task Endpoints

### `GET /api/tasks`

Returns the current user's tasks.

Query parameters:

- `status=open|completed|all`
- default is `open`

Response:

```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "Write release notes",
      "priority": "medium",
      "completedAt": null,
      "createdAt": "2026-04-20T10:00:00.000Z",
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

### `POST /api/tasks`

Creates a task for the authenticated user.

Request body:

```json
{
  "title": "Write release notes",
  "priority": "high"
}
```

Notes:

- `title` is required and trimmed before persistence
- `priority` is optional and defaults to `medium`
- valid priorities are `low`, `medium`, and `high`

Response:

```json
{
  "task": {
    "id": "task_123",
    "title": "Write release notes",
    "priority": "high",
    "completedAt": null,
    "createdAt": "2026-04-20T10:00:00.000Z",
    "updatedAt": "2026-04-20T10:00:00.000Z"
  }
}
```

### `PATCH /api/tasks/:taskId`

Updates the authenticated user's task.

Request body:

```json
{
  "title": "Write API release notes",
  "priority": "medium"
}
```

Notes:

- supports `title` and `priority` only
- an empty patch body is rejected with `400`

### `POST /api/tasks/:taskId/complete`

Marks the authenticated user's task complete by setting `completedAt`.

### `POST /api/tasks/:taskId/reopen`

Reopens the authenticated user's task by clearing `completedAt`.

## Focus Session Endpoints

Focus-session responses use this shape:

```json
{
  "session": {
    "id": "session_123",
    "durationMinutes": 25,
    "status": "active",
    "startedAt": "2026-04-20T10:00:00.000Z",
    "endedAt": null,
    "createdAt": "2026-04-20T10:00:00.000Z",
    "updatedAt": "2026-04-20T10:05:00.000Z",
    "tasks": [
      {
        "id": "task_123",
        "title": "Write release notes",
        "priority": "high",
        "completedAt": null,
        "createdAt": "2026-04-20T09:00:00.000Z",
        "updatedAt": "2026-04-20T09:00:00.000Z",
        "addedToSessionAt": "2026-04-20T10:05:00.000Z"
      }
    ]
  }
}
```

Rules:

- each user may have at most one active focus session at a time
- `durationMinutes` is optional and must be a positive whole number when provided
- only active sessions can be changed
- completed tasks cannot be added to a focus session
- completing a task from a focus session updates the canonical task record and keeps backlog continuity intact

### `GET /api/focus-sessions/current`

Returns the authenticated user's current active focus session, or `null` when none exists.

Response when no session is active:

```json
{
  "session": null
}
```

### `POST /api/focus-sessions`

Creates a new active focus session for the authenticated user.

Request body:

```json
{
  "durationMinutes": 25
}
```

Notes:

- send `{}` for a session with no duration
- creating a second active session returns `409`

### `POST /api/focus-sessions/:sessionId/end`

Ends the specified active focus session.

Notes:

- ending an already ended session returns `409`

### `POST /api/focus-sessions/:sessionId/tasks`

Adds an existing backlog task into the specified active focus session.

Request body:

```json
{
  "taskId": "task_123"
}
```

Notes:

- the task must belong to the authenticated user
- completed tasks are rejected with `400`
- adding the same task twice to the same session returns `409`

### `DELETE /api/focus-sessions/:sessionId/tasks/:taskId`

Removes a task from the specified active focus session.

Notes:

- removing a task that is not in the session returns `404`

### `POST /api/focus-sessions/:sessionId/tasks/:taskId/complete`

Marks a task complete through the focus-session flow after verifying it belongs to that session.

## Error Conventions

- `400` for invalid JSON or invalid task input
- `401` when no authenticated session exists
- `404` when a task does not exist for the current user
- `409` for focus-session conflicts such as creating a second active session or mutating an ended session
- `500` for unexpected server failures
