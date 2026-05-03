import type { tasks } from '../db/schema/index.js'
import type { TaskPriority } from './task-types.js'

export type TaskRow = typeof tasks.$inferSelect

export type TaskListSummaryRow = {
  listId: string | null
  listName: string | null
  listCreatedAt: Date | null
  listUpdatedAt: Date | null
}

export type TaskWithListRow = TaskRow & TaskListSummaryRow

export type TaskListSummaryDto = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type TaskDto = {
  id: string
  title: string
  priority: TaskPriority
  list: TaskListSummaryDto | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null
}

function mapTaskListSummary(task: TaskWithListRow): TaskListSummaryDto | null {
  if (
    !task.listId ||
    !task.listName ||
    !task.listCreatedAt ||
    !task.listUpdatedAt
  ) {
    return null
  }

  return {
    id: task.listId,
    name: task.listName,
    createdAt: task.listCreatedAt.toISOString(),
    updatedAt: task.listUpdatedAt.toISOString(),
  }
}

export function mapTaskRowToDto(task: TaskWithListRow): TaskDto {
  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    list: mapTaskListSummary(task),
    completedAt: serializeDate(task.completedAt),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
