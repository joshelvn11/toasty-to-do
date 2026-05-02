import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js'
import {
  addTaskToFocusSession,
  createFocusSession,
  removeTaskFromFocusSession,
} from './focus-session-service.js'
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
import { findTaskById } from '../tasks/task-repository.js'

vi.mock('./focus-session-repository.js', () => ({
  deleteFocusSessionTask: vi.fn(),
  findActiveFocusSessionByUserId: vi.fn(),
  findFocusSessionById: vi.fn(),
  findFocusSessionTask: vi.fn(),
  insertFocusSession: vi.fn(),
  insertFocusSessionTask: vi.fn(),
  listFocusSessionTasks: vi.fn(() => []),
  updateFocusSessionById: vi.fn(),
}))

vi.mock('../tasks/task-repository.js', () => ({
  findTaskById: vi.fn(),
}))

vi.mock('../tasks/task-service.js', () => ({
  completeTask: vi.fn(),
}))

const baseSession = {
  id: 'session-1',
  userId: 'user-1',
  durationMinutes: 25,
  startedAt: new Date('2026-05-02T09:00:00.000Z'),
  endedAt: null,
  createdAt: new Date('2026-05-02T09:00:00.000Z'),
  updatedAt: new Date('2026-05-02T09:00:00.000Z'),
}

const baseTask = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Write docs',
  priority: 'medium' as const,
  completedAt: null,
  createdAt: new Date('2026-05-02T09:00:00.000Z'),
  updatedAt: new Date('2026-05-02T09:00:00.000Z'),
}

describe('focus-session-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listFocusSessionTasks).mockReturnValue([])
  })

  it('rejects starting a second active session', () => {
    vi.mocked(findActiveFocusSessionByUserId).mockReturnValue(baseSession)

    expect(() => createFocusSession('user-1', {})).toThrow(ConflictError)
    expect(insertFocusSession).not.toHaveBeenCalled()
  })

  it('rejects adding a completed task to focus', () => {
    vi.mocked(findFocusSessionById).mockReturnValue(baseSession)
    vi.mocked(findTaskById).mockReturnValue({
      ...baseTask,
      completedAt: new Date('2026-05-02T10:00:00.000Z'),
    })

    expect(() =>
      addTaskToFocusSession('user-1', 'session-1', { taskId: 'task-1' }),
    ).toThrow(BadRequestError)
    expect(insertFocusSessionTask).not.toHaveBeenCalled()
  })

  it('rejects mutating an ended session', () => {
    vi.mocked(findFocusSessionById).mockReturnValue({
      ...baseSession,
      endedAt: new Date('2026-05-02T10:00:00.000Z'),
    })

    expect(() =>
      removeTaskFromFocusSession('user-1', 'session-1', 'task-1'),
    ).toThrow(ConflictError)
    expect(deleteFocusSessionTask).not.toHaveBeenCalled()
  })

  it('returns not found when a session does not belong to the user', () => {
    vi.mocked(findFocusSessionById).mockReturnValue(undefined)

    expect(() =>
      addTaskToFocusSession('user-1', 'session-404', { taskId: 'task-1' }),
    ).toThrow(NotFoundError)
  })

  it('returns not found when a task cannot be resolved for the user', () => {
    vi.mocked(findFocusSessionById).mockReturnValue(baseSession)
    vi.mocked(findTaskById).mockReturnValue(undefined)
    vi.mocked(findFocusSessionTask).mockReturnValue(undefined)

    expect(() =>
      addTaskToFocusSession('user-1', 'session-1', { taskId: 'task-404' }),
    ).toThrow(NotFoundError)
    expect(updateFocusSessionById).not.toHaveBeenCalled()
  })
})
