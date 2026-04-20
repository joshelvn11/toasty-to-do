import { randomUUID } from 'node:crypto'
import { BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js'
import { findTaskById } from '../tasks/task-repository.js'
import { completeTask } from '../tasks/task-service.js'
import {
  mapFocusSessionRowToDto,
  type FocusSessionDto,
  type FocusSessionRow,
} from './focus-session-mappers.js'
import {
  deleteFocusSessionTask,
  findActiveFocusSessionByUserId,
  findFocusSessionById,
  findFocusSessionTask,
  insertFocusSession,
  insertFocusSessionTask,
  listFocusSessionTasks,
  updateFocusSessionById,
} from './focus-session-repository.js'

export type CreateFocusSessionInput = {
  durationMinutes?: unknown
}

export type AddTaskToFocusSessionInput = {
  taskId?: unknown
}

function normalizeOptionalDurationMinutes(value: unknown) {
  if (value === undefined || value === null) {
    return null
  }

  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new BadRequestError(
      'Focus session duration must be a positive whole number of minutes.',
    )
  }

  return value
}

function normalizeTaskId(value: unknown) {
  if (typeof value !== 'string') {
    throw new BadRequestError('A task id is required.')
  }

  const taskId = value.trim()

  if (!taskId) {
    throw new BadRequestError('A task id is required.')
  }

  return taskId
}

function requireFocusSession(userId: string, sessionId: string) {
  const session = findFocusSessionById(userId, sessionId)

  if (!session) {
    throw new NotFoundError('Focus session not found.')
  }

  return session
}

function requireActiveFocusSession(userId: string, sessionId: string) {
  const session = requireFocusSession(userId, sessionId)

  if (session.endedAt) {
    throw new ConflictError('This focus session has already ended.')
  }

  return session
}

function mapSessionWithTasks(session: FocusSessionRow): FocusSessionDto {
  return mapFocusSessionRowToDto(session, listFocusSessionTasks(session.id))
}

function touchFocusSession(userId: string, sessionId: string) {
  return updateFocusSessionById(userId, sessionId, {
    updatedAt: new Date(),
  })
}

export function getCurrentFocusSession(userId: string): FocusSessionDto | null {
  const activeSession = findActiveFocusSessionByUserId(userId)

  if (!activeSession) {
    return null
  }

  return mapSessionWithTasks(activeSession)
}

export function createFocusSession(
  userId: string,
  input: CreateFocusSessionInput,
): FocusSessionDto {
  const existingActiveSession = findActiveFocusSessionByUserId(userId)

  if (existingActiveSession) {
    throw new ConflictError(
      'End your current focus session before starting a new one.',
    )
  }

  const session = insertFocusSession({
    id: randomUUID(),
    userId,
    durationMinutes: normalizeOptionalDurationMinutes(input.durationMinutes),
  })

  return mapSessionWithTasks(session)
}

export function endFocusSession(
  userId: string,
  sessionId: string,
): FocusSessionDto {
  requireActiveFocusSession(userId, sessionId)

  const endedAt = new Date()
  const session = updateFocusSessionById(userId, sessionId, {
    endedAt,
    updatedAt: endedAt,
  })

  return mapSessionWithTasks(session)
}

export function addTaskToFocusSession(
  userId: string,
  sessionId: string,
  input: AddTaskToFocusSessionInput,
): FocusSessionDto {
  requireActiveFocusSession(userId, sessionId)

  const taskId = normalizeTaskId(input.taskId)
  const task = findTaskById(userId, taskId)

  if (!task) {
    throw new NotFoundError('Task not found.')
  }

  if (task.completedAt) {
    throw new BadRequestError(
      'Completed tasks cannot be added to a focus session.',
    )
  }

  if (findFocusSessionTask(sessionId, taskId)) {
    throw new ConflictError('Task is already in this focus session.')
  }

  insertFocusSessionTask({
    focusSessionId: sessionId,
    taskId,
  })

  return mapSessionWithTasks(touchFocusSession(userId, sessionId))
}

export function removeTaskFromFocusSession(
  userId: string,
  sessionId: string,
  rawTaskId: unknown,
): FocusSessionDto {
  requireActiveFocusSession(userId, sessionId)

  const taskId = normalizeTaskId(rawTaskId)

  if (!findFocusSessionTask(sessionId, taskId)) {
    throw new NotFoundError('Task is not in this focus session.')
  }

  deleteFocusSessionTask(sessionId, taskId)

  return mapSessionWithTasks(touchFocusSession(userId, sessionId))
}

export function completeFocusSessionTask(
  userId: string,
  sessionId: string,
  rawTaskId: unknown,
): FocusSessionDto {
  requireActiveFocusSession(userId, sessionId)

  const taskId = normalizeTaskId(rawTaskId)

  if (!findFocusSessionTask(sessionId, taskId)) {
    throw new NotFoundError('Task is not in this focus session.')
  }

  const task = findTaskById(userId, taskId)

  if (!task) {
    throw new NotFoundError('Task not found.')
  }

  if (task.completedAt) {
    throw new BadRequestError('Task is already complete.')
  }

  completeTask(userId, taskId)

  return mapSessionWithTasks(touchFocusSession(userId, sessionId))
}
