import type { focusSessions } from '../db/schema/index.js'
import {
  mapTaskRowToDto,
  type TaskListSummaryRow,
  type TaskDto,
  type TaskRow,
} from '../tasks/task-mappers.js'
import {
  getFocusSessionStatus,
  type FocusSessionStatus,
} from './focus-session-types.js'

export type FocusSessionRow = typeof focusSessions.$inferSelect

export type FocusSessionTaskRow = TaskRow &
  TaskListSummaryRow & {
  addedToSessionAt: Date
}

export type FocusSessionTaskDto = TaskDto & {
  addedToSessionAt: string
}

export type FocusSessionDto = {
  id: string
  durationMinutes: number | null
  status: FocusSessionStatus
  startedAt: string
  endedAt: string | null
  createdAt: string
  updatedAt: string
  tasks: FocusSessionTaskDto[]
}

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null
}

export function mapFocusSessionTaskRowToDto(
  task: FocusSessionTaskRow,
): FocusSessionTaskDto {
  return {
    ...mapTaskRowToDto(task),
    addedToSessionAt: task.addedToSessionAt.toISOString(),
  }
}

export function mapFocusSessionRowToDto(
  session: FocusSessionRow,
  tasks: FocusSessionTaskRow[],
): FocusSessionDto {
  return {
    id: session.id,
    durationMinutes: session.durationMinutes,
    status: getFocusSessionStatus(session.endedAt),
    startedAt: session.startedAt.toISOString(),
    endedAt: serializeDate(session.endedAt),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    tasks: tasks.map(mapFocusSessionTaskRowToDto),
  }
}
