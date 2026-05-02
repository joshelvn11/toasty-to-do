import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShellPage } from './app-shell-page'
import { useAuthState } from '@/hooks/use-auth-state'
import { useBacklog } from '@/hooks/use-backlog'
import { useFocusSession } from '@/hooks/use-focus-session'

vi.mock('@/hooks/use-auth-state', () => ({
  useAuthState: vi.fn(),
}))

vi.mock('@/hooks/use-backlog', () => ({
  useBacklog: vi.fn(),
}))

vi.mock('@/hooks/use-focus-session', () => ({
  useFocusSession: vi.fn(),
}))

vi.mock('@/components/api-health-card', () => ({
  ApiHealthCard: () => <div>API health card</div>,
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
  },
}))

const authState = {
  status: 'authenticated' as const,
  error: null,
  user: {
    id: 'user-1',
    createdAt: new Date('2026-05-02T09:00:00.000Z'),
    updatedAt: new Date('2026-05-02T09:00:00.000Z'),
    name: 'Jordan',
    email: 'jordan@example.com',
    emailVerified: true,
    image: null,
  },
  session: {
    id: 'session-auth',
    createdAt: new Date('2026-05-02T09:00:00.000Z'),
    updatedAt: new Date('2026-05-02T09:00:00.000Z'),
    expiresAt: new Date('2026-05-02T11:00:00.000Z'),
    token: 'token-1',
    userId: 'user-1',
    ipAddress: null,
    userAgent: null,
  },
}

function createBacklogState(overrides: Partial<ReturnType<typeof useBacklog>> = {}) {
  return {
    filter: 'open' as const,
    tasks: [],
    hasLoadedOnce: true,
    isLoading: false,
    loadError: null,
    reload: vi.fn(),
    mutationError: null,
    isCreating: false,
    pendingTaskId: null,
    createTask: vi.fn().mockResolvedValue(true),
    updateTask: vi.fn().mockResolvedValue(true),
    completeTask: vi.fn().mockResolvedValue(true),
    reopenTask: vi.fn().mockResolvedValue(true),
    setFilter: vi.fn(),
    ...overrides,
  }
}

function createFocusState(overrides: Partial<ReturnType<typeof useFocusSession>> = {}) {
  return {
    session: null,
    hasLoadedOnce: true,
    isLoading: false,
    loadError: null,
    mutationError: null,
    isStarting: false,
    pendingSessionAction: null,
    pendingTaskId: null,
    pendingTaskAction: null,
    reload: vi.fn(),
    startSession: vi.fn().mockResolvedValue(true),
    endSession: vi.fn().mockResolvedValue(true),
    addTaskToSession: vi.fn().mockResolvedValue(true),
    removeTaskFromSession: vi.fn().mockResolvedValue(true),
    completeTaskInSession: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

function renderPage({
  backlog = createBacklogState(),
  focus = createFocusState(),
} = {}) {
  vi.mocked(useAuthState).mockReturnValue(authState)
  vi.mocked(useBacklog).mockReturnValue(backlog)
  vi.mocked(useFocusSession).mockReturnValue(focus)

  render(
    <MemoryRouter>
      <AppShellPage />
    </MemoryRouter>,
  )

  return { backlog, focus }
}

describe('AppShellPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('trims and submits new backlog tasks', async () => {
    const user = userEvent.setup()
    const { backlog } = renderPage()

    await user.type(screen.getByLabelText(/task title/i), '  Review PR  ')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(backlog.createTask).toHaveBeenCalledWith({
        title: 'Review PR',
        priority: 'medium',
      })
    })
  })

  it('shows edit validation for blank titles', async () => {
    const user = userEvent.setup()
    const { backlog } = renderPage({
      backlog: createBacklogState({
        tasks: [
          {
            id: 'task-1',
            title: 'Initial title',
            priority: 'medium',
            completedAt: null,
            createdAt: '2026-05-02T09:00:00.000Z',
            updatedAt: '2026-05-02T09:00:00.000Z',
          },
        ],
      }),
    })

    await user.click(screen.getByRole('button', { name: /^edit$/i }))
    await user.clear(screen.getByLabelText(/edit title/i))
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(backlog.updateTask).not.toHaveBeenCalled()
    expect(screen.getByText(/task title cannot be blank/i)).toBeTruthy()
  })

  it('adds backlog tasks into the active focus session', async () => {
    const user = userEvent.setup()
    const focus = createFocusState({
      session: {
        id: 'focus-1',
        durationMinutes: null,
        status: 'active',
        startedAt: '2026-05-02T09:00:00.000Z',
        endedAt: null,
        createdAt: '2026-05-02T09:00:00.000Z',
        updatedAt: '2026-05-02T09:00:00.000Z',
        tasks: [],
      },
    })

    renderPage({
      backlog: createBacklogState({
        tasks: [
          {
            id: 'task-1',
            title: 'Review PR',
            priority: 'medium',
            completedAt: null,
            createdAt: '2026-05-02T09:00:00.000Z',
            updatedAt: '2026-05-02T09:00:00.000Z',
          },
        ],
      }),
      focus,
    })

    await user.click(screen.getByRole('button', { name: /add to focus/i }))

    await waitFor(() => {
      expect(focus.addTaskToSession).toHaveBeenCalledWith('focus-1', 'task-1')
    })
  })

  it('completes focus tasks and refreshes the backlog', async () => {
    const user = userEvent.setup()
    const backlog = createBacklogState()
    const focus = createFocusState({
      session: {
        id: 'focus-1',
        durationMinutes: 25,
        status: 'active',
        startedAt: '2026-05-02T09:00:00.000Z',
        endedAt: null,
        createdAt: '2026-05-02T09:00:00.000Z',
        updatedAt: '2026-05-02T09:00:00.000Z',
        tasks: [
          {
            id: 'task-1',
            title: 'Review PR',
            priority: 'medium',
            completedAt: null,
            createdAt: '2026-05-02T09:00:00.000Z',
            updatedAt: '2026-05-02T09:00:00.000Z',
            addedToSessionAt: '2026-05-02T09:05:00.000Z',
          },
        ],
      },
    })

    renderPage({ backlog, focus })

    await user.click(screen.getByRole('button', { name: /^complete$/i }))

    await waitFor(() => {
      expect(focus.completeTaskInSession).toHaveBeenCalledWith('focus-1', 'task-1')
      expect(backlog.reload).toHaveBeenCalledTimes(1)
    })
  })

  it('renders backlog empty states', () => {
    renderPage()

    expect(screen.getByText(/nothing is waiting right now/i)).toBeTruthy()
  })
})
