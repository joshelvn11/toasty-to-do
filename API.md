# API Reference

## Authentication

- Better Auth is mounted at `/api/auth/*`.
- Task endpoints below require an authenticated Better Auth session.
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

## Error Conventions

- `400` for invalid JSON or invalid task input
- `401` when no authenticated session exists
- `404` when a task does not exist for the current user
- `500` for unexpected server failures
