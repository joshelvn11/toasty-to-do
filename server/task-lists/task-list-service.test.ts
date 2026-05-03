import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import {
  createTaskList,
  deleteTaskList,
  updateTaskList,
} from './task-list-service.js'
import {
  deleteTaskListById,
  findTaskListById,
  insertTaskList,
  updateTaskListById,
} from './task-list-repository.js'

vi.mock('./task-list-repository.js', () => ({
  deleteTaskListById: vi.fn(),
  findTaskListById: vi.fn(),
  insertTaskList: vi.fn(),
  listTaskListsByUserId: vi.fn(),
  updateTaskListById: vi.fn(),
}))

describe('task-list-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects blank list names during create', () => {
    expect(() => createTaskList('user-1', { name: '   ' })).toThrow(BadRequestError)
    expect(insertTaskList).not.toHaveBeenCalled()
  })

  it('returns not found when renaming a missing or foreign list', () => {
    vi.mocked(findTaskListById).mockReturnValue(undefined)

    expect(() => updateTaskList('user-1', 'list-404', { name: 'Work' })).toThrow(
      NotFoundError,
    )
    expect(updateTaskListById).not.toHaveBeenCalled()
  })

  it('deletes an owned list through the repository layer', () => {
    vi.mocked(findTaskListById).mockReturnValue({
      id: 'list-1',
      userId: 'user-1',
      name: 'Work',
      createdAt: new Date('2026-05-02T09:00:00.000Z'),
      updatedAt: new Date('2026-05-02T09:00:00.000Z'),
    })

    deleteTaskList('user-1', 'list-1')

    expect(deleteTaskListById).toHaveBeenCalledWith('user-1', 'list-1')
  })
})
