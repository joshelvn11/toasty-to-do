import type { tasks } from '../db/schema/index.js'
import type { TaskPriority } from './task-types.js'

export type TaskRow = typeof tasks.$inferSelect

export type TaskDto = {
  id: string
  title: string
  priority: TaskPriority
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null
}

export function mapTaskRowToDto(task: TaskRow): TaskDto {
  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    completedAt: serializeDate(task.completedAt),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
