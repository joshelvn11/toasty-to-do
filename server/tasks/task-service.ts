import { randomUUID } from 'node:crypto'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { mapTaskRowToDto, type TaskDto } from './task-mappers.js'
import {
  findTaskById,
  insertTask,
  listTasksByUserId,
  updateTaskById,
} from './task-repository.js'
import {
  DEFAULT_TASK_PRIORITY,
  isTaskListStatus,
  isTaskPriority,
  type TaskListStatus,
  type TaskPriority,
} from './task-types.js'

export type CreateTaskInput = {
  title?: unknown
  priority?: unknown
}

export type UpdateTaskInput = {
  title?: unknown
  priority?: unknown
}

function normalizeRequiredTitle(value: unknown) {
  if (typeof value !== 'string') {
    throw new BadRequestError('Task title is required.')
  }

  const title = value.trim()

  if (!title) {
    throw new BadRequestError('Task title cannot be blank.')
  }

  return title
}

function normalizeOptionalTitle(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new BadRequestError('Task title must be a string.')
  }

  const title = value.trim()

  if (!title) {
    throw new BadRequestError('Task title cannot be blank.')
  }

  return title
}

function normalizeCreatePriority(value: unknown): TaskPriority {
  if (value === undefined) {
    return DEFAULT_TASK_PRIORITY
  }

  if (!isTaskPriority(value)) {
    throw new BadRequestError('Task priority must be low, medium, or high.')
  }

  return value
}

function normalizeOptionalPriority(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  if (!isTaskPriority(value)) {
    throw new BadRequestError('Task priority must be low, medium, or high.')
  }

  return value
}

function requireTask(userId: string, taskId: string) {
  const task = findTaskById(userId, taskId)

  if (!task) {
    throw new NotFoundError('Task not found.')
  }

  return task
}

export function createTask(userId: string, input: CreateTaskInput): TaskDto {
  const task = insertTask({
    id: randomUUID(),
    userId,
    title: normalizeRequiredTitle(input.title),
    priority: normalizeCreatePriority(input.priority),
  })

  return mapTaskRowToDto(task)
}

export function listTasks(
  userId: string,
  rawStatus: unknown,
): { status: TaskListStatus; tasks: TaskDto[] } {
  const status = rawStatus === undefined ? 'open' : rawStatus

  if (!isTaskListStatus(status)) {
    throw new BadRequestError('Task status must be open, completed, or all.')
  }

  return {
    status,
    tasks: listTasksByUserId(userId, status).map(mapTaskRowToDto),
  }
}

export function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): TaskDto {
  requireTask(userId, taskId)

  const title = normalizeOptionalTitle(input.title)
  const priority = normalizeOptionalPriority(input.priority)

  if (title === undefined && priority === undefined) {
    throw new BadRequestError('Task updates must include a title or priority.')
  }

  const task = updateTaskById(userId, taskId, {
    title,
    priority,
    updatedAt: new Date(),
  })

  return mapTaskRowToDto(task)
}

export function completeTask(userId: string, taskId: string): TaskDto {
  requireTask(userId, taskId)

  const completedAt = new Date()
  const task = updateTaskById(userId, taskId, {
    completedAt,
    updatedAt: completedAt,
  })

  return mapTaskRowToDto(task)
}

export function reopenTask(userId: string, taskId: string): TaskDto {
  requireTask(userId, taskId)

  const task = updateTaskById(userId, taskId, {
    completedAt: null,
    updatedAt: new Date(),
  })

  return mapTaskRowToDto(task)
}
