import type { taskLists } from '../db/schema/index.js'

export type TaskListRow = typeof taskLists.$inferSelect

export type TaskListDto = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function mapTaskListRowToDto(list: TaskListRow): TaskListDto {
  return {
    id: list.id,
    name: list.name,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  }
}
