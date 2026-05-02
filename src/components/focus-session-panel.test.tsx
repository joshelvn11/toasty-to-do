import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FocusSessionPanel } from './focus-session-panel'

function renderFocusSessionPanel(
  overrides: Partial<React.ComponentProps<typeof FocusSessionPanel>> = {},
) {
  const onRetry = vi.fn()
  const onStartSession = vi.fn().mockResolvedValue(true)
  const onEndSession = vi.fn()
  const onCompleteTask = vi.fn()
  const onRemoveTask = vi.fn()

  render(
    <FocusSessionPanel
      getTaskError={() => null}
      isLoading={false}
      isStarting={false}
      loadError={null}
      onCompleteTask={onCompleteTask}
      onEndSession={onEndSession}
      onRemoveTask={onRemoveTask}
      onRetry={onRetry}
      onStartSession={onStartSession}
      pendingSessionAction={null}
      pendingTaskId={null}
      session={null}
      sessionError={null}
      startError={null}
      {...overrides}
    />,
  )

  return {
    onRetry,
    onStartSession,
    onEndSession,
    onCompleteTask,
    onRemoveTask,
  }
}

describe('FocusSessionPanel', () => {
  it('blocks invalid duration input before starting a session', async () => {
    const user = userEvent.setup()
    const { onStartSession } = renderFocusSessionPanel()

    await user.type(screen.getByLabelText(/optional duration/i), '0')
    await user.click(screen.getByRole('button', { name: /start focus session/i }))

    expect(onStartSession).not.toHaveBeenCalled()
    expect(screen.getByText(/positive whole number of minutes/i)).toBeTruthy()
  })

  it('renders retryable load errors', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderFocusSessionPanel({
      loadError: 'Network down',
    })

    expect(screen.getByText(/could not load the current focus session/i)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders the empty active-session state', () => {
    renderFocusSessionPanel({
      session: {
        id: 'session-1',
        durationMinutes: 25,
        status: 'active',
        startedAt: '2026-05-02T09:00:00.000Z',
        endedAt: null,
        createdAt: '2026-05-02T09:00:00.000Z',
        updatedAt: '2026-05-02T09:00:00.000Z',
        tasks: [],
      },
    })

    expect(screen.getByText(/no tasks are in this session yet/i)).toBeTruthy()
  })
})
