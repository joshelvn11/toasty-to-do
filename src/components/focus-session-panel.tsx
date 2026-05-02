import { type FormEvent, useState } from 'react'
import type { FocusSession } from '../lib/focus-session-api.ts'
import { type TaskPriority } from '../lib/task-api.ts'

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

type FocusSessionPanelProps = {
  session: FocusSession | null
  isLoading: boolean
  loadError: string | null
  isStarting: boolean
  pendingSessionAction: 'end' | null
  pendingTaskId: string | null
  pendingTaskAction: 'remove' | 'complete' | null
  startError: string | null
  sessionError: string | null
  getTaskError: (taskId: string) => string | null
  onRetry: () => void
  onStartSession: (durationMinutes: number | null) => Promise<boolean> | boolean
  onEndSession: () => Promise<void> | void
  onCompleteTask: (taskId: string) => Promise<void> | void
  onRemoveTask: (taskId: string) => Promise<void> | void
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function FocusSessionPanel({
  session,
  isLoading,
  loadError,
  isStarting,
  pendingSessionAction,
  pendingTaskId,
  pendingTaskAction,
  startError,
  sessionError,
  getTaskError,
  onRetry,
  onStartSession,
  onEndSession,
  onCompleteTask,
  onRemoveTask,
}: FocusSessionPanelProps) {
  const [durationInput, setDurationInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedValue = durationInput.trim()

    if (!trimmedValue) {
      setValidationError(null)
      const started = await onStartSession(null)

      if (started) {
        setDurationInput('')
      }

      return
    }

    const durationMinutes = Number(trimmedValue)

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
      setValidationError('Use a positive whole number of minutes, or leave it blank.')
      return
    }

    setValidationError(null)
    const started = await onStartSession(durationMinutes)

    if (started) {
      setDurationInput('')
    }
  }

  const activeTaskCount =
    session?.tasks.filter((task) => !task.completedAt).length ?? 0
  const completedTaskCount =
    session?.tasks.filter((task) => Boolean(task.completedAt)).length ?? 0

  const sessionEndsAt =
    !session || session.durationMinutes === null
      ? null
      : new Date(
          new Date(session.startedAt).getTime() + session.durationMinutes * 60_000,
        ).toISOString()

  const isBusy = isStarting || pendingSessionAction === 'end' || Boolean(pendingTaskId)

  return (
    <section className="workspace-card focus-session-card" aria-live="polite">
      <header>
        <div>
          <div className="eyebrow">Current focus</div>
          <h3 className="brand-title">Separate today from everything else</h3>
        </div>
        <span
          className={`status-pill ${
            loadError ? 'error' : isLoading ? 'loading' : session ? 'ready' : 'idle'
          }`}
        >
          {loadError
            ? 'Error'
            : isLoading
              ? 'Loading'
              : session
                ? 'Active'
                : 'Idle'}
        </span>
      </header>

      {loadError ? (
        <section className="focus-state-card">
          <div className="section-tag">Focus error</div>
          <h3>We could not load the current focus session.</h3>
          <p>{loadError}</p>
          <button className="secondary-button" onClick={onRetry} type="button">
            Try again
          </button>
        </section>
      ) : null}

      {!loadError && session ? (
        <>
          <p className="focus-panel-copy">
            The focus list is the deliberate slice of backlog work you are
            actively working from right now.
          </p>

          <div className="focus-summary-grid">
            <article className="focus-metric">
              <span className="focus-metric-label">Started</span>
              <strong>{formatDateTime(session.startedAt)}</strong>
            </article>
            <article className="focus-metric">
              <span className="focus-metric-label">Duration</span>
              <strong>
                {session.durationMinutes === null
                  ? 'Open-ended'
                  : `${session.durationMinutes} min`}
              </strong>
            </article>
            <article className="focus-metric">
              <span className="focus-metric-label">Open in focus</span>
              <strong>{activeTaskCount}</strong>
            </article>
            <article className="focus-metric">
              <span className="focus-metric-label">Completed here</span>
              <strong>{completedTaskCount}</strong>
            </article>
          </div>

          <div className="focus-session-meta">
            <span className="code-chip">
              {sessionEndsAt
                ? `Timebox ends at ${formatTime(sessionEndsAt)}`
                : 'No time limit set for this session'}
            </span>

            <button
              className="secondary-button"
              disabled={isBusy}
              onClick={() => void onEndSession()}
              type="button"
            >
              {pendingSessionAction === 'end' ? 'Ending...' : 'End session'}
            </button>
          </div>

          {sessionError ? <p className="form-message error">{sessionError}</p> : null}

          {session.tasks.length === 0 ? (
            <section className="focus-state-card">
              <div className="section-tag">Empty focus</div>
              <h3>No tasks are in this session yet.</h3>
              <p>
                Use the backlog actions to add a few open tasks here and keep
                the current working set intentionally small.
              </p>
            </section>
          ) : (
            <ul className="focus-task-list">
              {session.tasks.map((task) => {
                const isTaskBusy = pendingTaskId === task.id
                const taskError = getTaskError(task.id)

                return (
                  <li
                    key={task.id}
                    className={`focus-task-card ${
                      task.completedAt ? 'is-completed' : ''
                    }`}
                  >
                    <div className="task-main">
                      <div className="task-copy">
                        <h3>{task.title}</h3>
                        <p>Added to focus {formatDateTime(task.addedToSessionAt)}</p>
                      </div>

                      <div className="task-meta">
                        <span className={`priority-badge ${task.priority}`}>
                          {PRIORITY_LABELS[task.priority]} priority
                        </span>
                        <span className="task-state-chip in-focus">In focus</span>
                        {task.completedAt ? (
                          <span className="task-state-chip">Completed</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="focus-task-actions">
                      {!task.completedAt ? (
                        <button
                          className="button-link"
                          disabled={isBusy}
                          onClick={() => void onCompleteTask(task.id)}
                          type="button"
                        >
                          {isTaskBusy && pendingTaskAction === 'complete'
                            ? 'Completing...'
                            : 'Complete'}
                        </button>
                      ) : null}

                      <button
                        className="secondary-button"
                        disabled={isBusy}
                        onClick={() => void onRemoveTask(task.id)}
                        type="button"
                      >
                        {isTaskBusy && pendingTaskAction === 'remove'
                          ? task.completedAt
                            ? 'Removing...'
                            : 'Returning...'
                          : task.completedAt
                            ? 'Remove from focus'
                            : 'Return to backlog'}
                      </button>
                    </div>

                    {taskError ? <p className="form-message error">{taskError}</p> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : null}

      {!loadError && !session && isLoading ? (
        <section className="focus-state-card">
          <div className="section-tag">Loading</div>
          <h3>Checking whether a focus session is already running.</h3>
          <p>
            The app is loading the authenticated <code>/api/focus-sessions/current</code>{' '}
            state before we show focus actions.
          </p>
        </section>
      ) : null}

      {!loadError && !session && !isLoading ? (
        <>
          <p className="focus-panel-copy">
            Your backlog stays complete on the left. Start a focus session here
            when you want a smaller working set with an optional timebox.
          </p>

          <form className="focus-start-form" noValidate onSubmit={handleSubmit}>
            <label className="field">
              <span>Session duration in minutes</span>
              <input
                className="field-input"
                disabled={isStarting}
                inputMode="numeric"
                min="1"
                onChange={(event) => {
                  setDurationInput(event.target.value)
                  if (validationError) {
                    setValidationError(null)
                  }
                }}
                placeholder="Leave blank for an open-ended session"
                type="number"
                value={durationInput}
              />
            </label>

            <button className="button-link" disabled={isStarting} type="submit">
              {isStarting ? 'Starting...' : 'Start focus session'}
            </button>
          </form>

          {validationError ? <p className="form-message error">{validationError}</p> : null}
          {startError ? <p className="form-message error">{startError}</p> : null}

          <div className="focus-note">
            Pull open backlog tasks into focus once the session starts. Completed
            work remains part of the canonical backlog history.
          </div>
        </>
      ) : null}
    </section>
  )
}
