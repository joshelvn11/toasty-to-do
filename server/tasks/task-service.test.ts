import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { createTask, listTasks, updateTask } from './task-service.js'
import {
  findTaskById,
  insertTask,
  listTasksByUserId,
  updateTaskById,
} from './task-repository.js'

vi.mock('./task-repository.js', () => ({
  findTaskById: vi.fn(),
  insertTask: vi.fn(),
  listTasksByUserId: vi.fn(),
  updateTaskById: vi.fn(),
}))

describe('task-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects blank task titles during create', () => {
    expect(() => createTask('user-1', { title: '   ' })).toThrow(BadRequestError)
    expect(insertTask).not.toHaveBeenCalled()
  })

  it('rejects invalid task list statuses', () => {
    expect(() => listTasks('user-1', 'later')).toThrow(BadRequestError)
    expect(listTasksByUserId).not.toHaveBeenCalled()
  })

  it('returns not found when updating a missing or foreign task', () => {
    vi.mocked(findTaskById).mockReturnValue(undefined)

    expect(() =>
      updateTask('user-1', 'task-404', { title: 'Updated title' }),
    ).toThrow(NotFoundError)
    expect(updateTaskById).not.toHaveBeenCalled()
  })
})
