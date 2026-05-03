import { randomUUID } from 'node:crypto'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { mapTaskListRowToDto, type TaskListDto } from './task-list-mappers.js'
import {
  deleteTaskListById,
  findTaskListById,
  insertTaskList,
  listTaskListsByUserId,
  updateTaskListById,
} from './task-list-repository.js'

export type CreateTaskListInput = {
  name?: unknown
}

export type UpdateTaskListInput = {
  name?: unknown
}

function normalizeRequiredName(value: unknown) {
  if (typeof value !== 'string') {
    throw new BadRequestError('List name is required.')
  }

  const name = value.trim()

  if (!name) {
    throw new BadRequestError('List name cannot be blank.')
  }

  return name
}

function requireTaskList(userId: string, listId: string) {
  const list = findTaskListById(userId, listId)

  if (!list) {
    throw new NotFoundError('List not found.')
  }

  return list
}

export function createTaskList(
  userId: string,
  input: CreateTaskListInput,
): TaskListDto {
  const list = insertTaskList({
    id: randomUUID(),
    userId,
    name: normalizeRequiredName(input.name),
  })

  return mapTaskListRowToDto(list)
}

export function listTaskLists(userId: string): TaskListDto[] {
  return listTaskListsByUserId(userId).map(mapTaskListRowToDto)
}

export function updateTaskList(
  userId: string,
  listId: string,
  input: UpdateTaskListInput,
): TaskListDto {
  requireTaskList(userId, listId)

  const list = updateTaskListById(userId, listId, {
    name: normalizeRequiredName(input.name),
    updatedAt: new Date(),
  })

  return mapTaskListRowToDto(list)
}

export function deleteTaskList(userId: string, listId: string) {
  requireTaskList(userId, listId)
  deleteTaskListById(userId, listId)
}
