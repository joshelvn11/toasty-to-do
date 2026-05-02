import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'
import { FocusSessionPanel } from '../components/focus-session-panel.tsx'
import { useAuthState } from '../hooks/use-auth-state.ts'
import { useBacklog } from '../hooks/use-backlog.ts'
import { useFocusSession } from '../hooks/use-focus-session.ts'
import { authClient } from '../lib/auth-client.ts'
import {
  TASK_LIST_STATUSES,
  TASK_PRIORITIES,
  type Task,
  type TaskListStatus,
  type TaskPriority,
} from '../lib/task-api.ts'

const FILTER_LABELS: Record<TaskListStatus, string> = {
  open: 'Open',
  completed: 'Completed',
  all: 'All',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function AppShellPage() {
  const auth = useAuthState()
  const backlog = useBacklog()
  const focusSession = useFocusSession()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [createValidationError, setCreateValidationError] = useState<string | null>(
    null,
  )
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium')
  const [editValidationError, setEditValidationError] = useState<string | null>(null)

  if (auth.status !== 'authenticated') {
    return null
  }

  const currentFocusSession = focusSession.session
  const focusTaskIds = new Set(currentFocusSession?.tasks.map((task) => task.id) ?? [])
  const activeFocusTaskCount =
    currentFocusSession?.tasks.filter((task) => !task.completedAt).length ?? 0
  const isAnyFocusActionPending =
    focusSession.isStarting ||
    Boolean(focusSession.pendingSessionAction) ||
    Boolean(focusSession.pendingTaskId)

  const startError =
    focusSession.mutationError?.scope === 'start'
      ? focusSession.mutationError.message
      : null

  const sessionError =
    focusSession.mutationError?.scope === 'session'
      ? focusSession.mutationError.message
      : null

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await authClient.signOut()
      navigate('/sign-in', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  function beginEdit(task: Task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditValidationError(null)
  }

  function cancelEdit() {
    setEditingTaskId(null)
    setEditTitle('')
    setEditPriority('medium')
    setEditValidationError(null)
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = newTaskTitle.trim()

    if (!title) {
      setCreateValidationError('Give the task a title before adding it to the backlog.')
      return
    }

    setCreateValidationError(null)

    const created = await backlog.createTask({
      title,
      priority: newTaskPriority,
    })

    if (!created) {
      return
    }

    setNewTaskTitle('')
    setNewTaskPriority('medium')
  }

  async function handleSaveEdit(taskId: string) {
    const title = editTitle.trim()

    if (!title) {
      setEditValidationError('Task title cannot be blank.')
      return
    }

    setEditValidationError(null)

    const saved = await backlog.updateTask(taskId, {
      title,
      priority: editPriority,
    })

    if (!saved) {
      return
    }

    if (focusTaskIds.has(taskId)) {
      focusSession.reload()
    }

    cancelEdit()
  }

  async function handleToggleTask(task: Task) {
    const succeeded = task.completedAt
      ? await backlog.reopenTask(task.id)
      : await backlog.completeTask(task.id)

    if (!succeeded) {
      return
    }

    if (editingTaskId === task.id) {
      cancelEdit()
    }

    if (focusTaskIds.has(task.id)) {
      focusSession.reload()
    }
  }

  async function handleStartFocusSession(durationMinutes: number | null) {
    return focusSession.startSession({ durationMinutes })
  }

  async function handleEndFocusSession() {
    if (!currentFocusSession) {
      return
    }

    await focusSession.endSession(currentFocusSession.id)
  }

  async function handleAddTaskToFocus(taskId: string) {
    if (!currentFocusSession) {
      return
    }

    await focusSession.addTaskToSession(currentFocusSession.id, taskId)
  }

  async function handleRemoveTaskFromFocus(taskId: string) {
    if (!currentFocusSession) {
      return
    }

    await focusSession.removeTaskFromSession(currentFocusSession.id, taskId)
  }

  async function handleCompleteTaskInFocus(taskId: string) {
    if (!currentFocusSession) {
      return
    }

    const completed = await focusSession.completeTaskInSession(
      currentFocusSession.id,
      taskId,
    )

    if (!completed) {
      return
    }

    backlog.reload()

    if (editingTaskId === taskId) {
      cancelEdit()
    }
  }

  function getFocusTaskError(taskId: string) {
    return focusSession.mutationError?.scope === 'task' &&
      focusSession.mutationError.taskId === taskId
      ? focusSession.mutationError.message
      : null
  }

  const createErrorMessage =
    createValidationError ??
    (backlog.mutationError?.scope === 'create' ? backlog.mutationError.message : null)

  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="app-topbar">
          <div className="brand-block">
            <div className="brand-mark">Protected workspace</div>
            <h1 className="brand-title">{auth.user.name}'s backlog and focus</h1>
            <p className="brand-copy">
              Keep the full list visible, then pull only a few tasks into the
              current focus so the next action stays obvious.
            </p>
          </div>

          <nav className="nav-links" aria-label="App links">
            <Link className="link-pill" to="/">
              Public home
            </Link>
            <button
              className="button-link button-reset"
              disabled={isSigningOut}
              onClick={handleSignOut}
              type="button"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </nav>
        </header>

        <section className="app-grid">
          <section className="workspace-card">
            <header>
              <div>
                <div className="eyebrow">Backlog</div>
                <h3 className="brand-title">Your full task list lives here</h3>
              </div>
              <span className="status-badge">{FILTER_LABELS[backlog.filter]} view</span>
            </header>

            <p className="workspace-copy">
              Capture everything in one place, then use the focus panel to pull
              a smaller working set out of the backlog without creating duplicate
              task records.
            </p>

            <section className="backlog-capture" aria-label="Add a task">
              <form className="backlog-form" noValidate onSubmit={handleCreateTask}>
                <label className="field backlog-field backlog-title-field">
                  <span>Task title</span>
                  <input
                    className="field-input"
                    disabled={backlog.isCreating || backlog.isLoading}
                    name="title"
                    onChange={(event) => {
                      setNewTaskTitle(event.target.value)
                      if (createValidationError) {
                        setCreateValidationError(null)
                      }
                    }}
                    placeholder="Write down what needs doing"
                    type="text"
                    value={newTaskTitle}
                  />
                </label>

                <label className="field backlog-field">
                  <span>Priority</span>
                  <select
                    className="field-input"
                    disabled={backlog.isCreating || backlog.isLoading}
                    name="priority"
                    onChange={(event) =>
                      setNewTaskPriority(event.target.value as TaskPriority)
                    }
                    value={newTaskPriority}
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="button-link backlog-submit"
                  disabled={backlog.isCreating || backlog.isLoading}
                  type="submit"
                >
                  {backlog.isCreating ? 'Adding...' : 'Add task'}
                </button>
              </form>

              {createErrorMessage ? (
                <p className="form-message error">{createErrorMessage}</p>
              ) : null}
            </section>

            <section className="backlog-toolbar" aria-label="Backlog controls">
              <div className="backlog-filters" role="tablist" aria-label="Task filters">
                {TASK_LIST_STATUSES.map((status) => (
                  <button
                    key={status}
                    aria-pressed={backlog.filter === status}
                    className={`filter-chip ${backlog.filter === status ? 'active' : ''}`}
                    disabled={backlog.isLoading}
                    onClick={() => {
                      cancelEdit()
                      backlog.setFilter(status)
                    }}
                    type="button"
                  >
                    {FILTER_LABELS[status]}
                  </button>
                ))}
              </div>

              <div className="backlog-toolbar-status">
                <span className={`status-pill ${backlog.isLoading ? 'loading' : 'ready'}`}>
                  {backlog.isLoading
                    ? 'Loading tasks'
                    : `${backlog.tasks.length} ${
                        backlog.tasks.length === 1 ? 'task' : 'tasks'
                      }`}
                </span>
                <span
                  className={`status-pill ${
                    currentFocusSession ? 'focus-active' : 'idle'
                  }`}
                >
                  {currentFocusSession
                    ? `${activeFocusTaskCount} in focus`
                    : 'No active focus session'}
                </span>
              </div>
            </section>

            <section className="backlog-content" aria-live="polite">
              {backlog.loadError ? (
                <section className="backlog-state-card">
                  <div className="section-tag">Load error</div>
                  <h3>We could not load your backlog.</h3>
                  <p>{backlog.loadError}</p>
                  <button className="secondary-button" onClick={backlog.reload} type="button">
                    Try again
                  </button>
                </section>
              ) : null}

              {!backlog.loadError && backlog.isLoading ? (
                <section className="backlog-state-card">
                  <div className="section-tag">Loading</div>
                  <h3>Pulling in your current backlog.</h3>
                  <p>
                    The task list is loading through the authenticated{' '}
                    <code>/api/tasks</code> endpoint.
                  </p>
                </section>
              ) : null}

              {!backlog.loadError && !backlog.isLoading && backlog.tasks.length === 0 ? (
                <EmptyBacklogState filter={backlog.filter} />
              ) : null}

              {!backlog.loadError && !backlog.isLoading && backlog.tasks.length > 0 ? (
                <ul className="task-list">
                  {backlog.tasks.map((task) => {
                    const isEditing = editingTaskId === task.id
                    const isBacklogTaskBusy = backlog.pendingTaskId === task.id
                    const isInFocus = focusTaskIds.has(task.id)
                    const focusTaskError = getFocusTaskError(task.id)
                    const backlogTaskError =
                      backlog.mutationError?.scope === 'task' &&
                      backlog.mutationError.taskId === task.id
                        ? backlog.mutationError.message
                        : null

                    return (
                      <li
                        key={task.id}
                        className={`task-card ${task.completedAt ? 'is-completed' : ''} ${
                          isInFocus ? 'is-in-focus' : ''
                        }`}
                      >
                        {isEditing ? (
                          <div className="task-edit-grid">
                            <label className="field backlog-field backlog-title-field">
                              <span>Edit title</span>
                              <input
                                className="field-input"
                                disabled={isBacklogTaskBusy}
                                onChange={(event) => {
                                  setEditTitle(event.target.value)
                                  if (editValidationError) {
                                    setEditValidationError(null)
                                  }
                                }}
                                type="text"
                                value={editTitle}
                              />
                            </label>

                            <label className="field backlog-field">
                              <span>Edit priority</span>
                              <select
                                className="field-input"
                                disabled={isBacklogTaskBusy}
                                onChange={(event) =>
                                  setEditPriority(event.target.value as TaskPriority)
                                }
                                value={editPriority}
                              >
                                {TASK_PRIORITIES.map((priority) => (
                                  <option key={priority} value={priority}>
                                    {PRIORITY_LABELS[priority]}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <div className="task-actions task-actions-edit">
                              <button
                                className="button-link"
                                disabled={isBacklogTaskBusy}
                                onClick={() => void handleSaveEdit(task.id)}
                                type="button"
                              >
                                {isBacklogTaskBusy ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                className="secondary-button"
                                disabled={isBacklogTaskBusy}
                                onClick={cancelEdit}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>

                            {editValidationError ? (
                              <p className="form-message error">{editValidationError}</p>
                            ) : null}

                            {backlogTaskError ? (
                              <p className="form-message error">{backlogTaskError}</p>
                            ) : null}
                          </div>
                        ) : (
                          <>
                            <div className="task-main">
                              <div className="task-copy">
                                <h3>{task.title}</h3>
                                <p>
                                  Updated{' '}
                                  {new Date(task.updatedAt).toLocaleString([], {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </p>
                              </div>

                              <div className="task-meta">
                                <span className={`priority-badge ${task.priority}`}>
                                  {PRIORITY_LABELS[task.priority]} priority
                                </span>
                                {isInFocus ? (
                                  <span className="task-state-chip in-focus">
                                    {task.completedAt ? 'Completed in focus' : 'In focus'}
                                  </span>
                                ) : null}
                                {task.completedAt ? (
                                  <span className="task-state-chip">Completed</span>
                                ) : null}
                              </div>
                            </div>

                            <div className="task-actions">
                              <button
                                className="secondary-button"
                                disabled={Boolean(backlog.pendingTaskId)}
                                onClick={() => beginEdit(task)}
                                type="button"
                              >
                                Edit
                              </button>

                              {currentFocusSession && !task.completedAt ? (
                                <button
                                  className="secondary-button"
                                  disabled={
                                    isInFocus ||
                                    Boolean(backlog.pendingTaskId) ||
                                    isAnyFocusActionPending
                                  }
                                  onClick={() => void handleAddTaskToFocus(task.id)}
                                  type="button"
                                >
                                  {focusSession.pendingTaskId === task.id &&
                                  focusSession.pendingTaskAction === 'add'
                                    ? 'Adding...'
                                    : isInFocus
                                      ? 'In focus'
                                      : 'Add to focus'}
                                </button>
                              ) : null}

                              <button
                                className={task.completedAt ? 'secondary-button' : 'button-link'}
                                disabled={Boolean(backlog.pendingTaskId)}
                                onClick={() => void handleToggleTask(task)}
                                type="button"
                              >
                                {isBacklogTaskBusy
                                  ? task.completedAt
                                    ? 'Reopening...'
                                    : 'Completing...'
                                  : task.completedAt
                                    ? 'Reopen'
                                    : 'Complete'}
                              </button>
                            </div>

                            {backlogTaskError ? (
                              <p className="form-message error">{backlogTaskError}</p>
                            ) : null}
                            {focusTaskError ? (
                              <p className="form-message error">{focusTaskError}</p>
                            ) : null}
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </section>
          </section>

          <aside className="stack-list">
            <FocusSessionPanel
              getTaskError={(taskId) => {
                if (
                  focusSession.mutationError?.scope === 'task' &&
                  focusSession.mutationError.action !== 'add' &&
                  focusSession.mutationError.taskId === taskId
                ) {
                  return focusSession.mutationError.message
                }

                return null
              }}
              isLoading={focusSession.isLoading}
              isStarting={focusSession.isStarting}
              loadError={focusSession.loadError}
              onCompleteTask={handleCompleteTaskInFocus}
              onEndSession={handleEndFocusSession}
              onRemoveTask={handleRemoveTaskFromFocus}
              onRetry={focusSession.reload}
              onStartSession={handleStartFocusSession}
              pendingSessionAction={focusSession.pendingSessionAction}
              pendingTaskAction={
                focusSession.pendingTaskAction === 'add'
                  ? null
                  : focusSession.pendingTaskAction
              }
              pendingTaskId={focusSession.pendingTaskId}
              session={currentFocusSession}
              sessionError={sessionError}
              startError={startError}
            />

            <section className="session-card">
              <header>
                <div>
                  <div className="eyebrow">Current user</div>
                  <h3>{auth.user.name}</h3>
                </div>
                <span className="status-pill ready">Signed in</span>
              </header>

              <p>{auth.user.email}</p>

              <div className="session-meta">
                <span className="code-chip">
                  Session expires {new Date(auth.session.expiresAt).toLocaleString()}
                </span>
              </div>
            </section>

            <section className="status-card">
              <header>
                <div>
                  <div className="eyebrow">Workflow split</div>
                  <h3>Backlog and current focus now work together</h3>
                </div>
                <span className="status-pill ready">Phase 6 live</span>
              </header>

              <ul className="status-list">
                <li>Backlog stays the full source list for every task you own</li>
                <li>Focus sessions pull a temporary working set from backlog tasks</li>
                <li>Completing work in focus still updates the same canonical task record</li>
                <li>Returning a task removes it from focus without deleting it from backlog</li>
              </ul>
            </section>

            <ApiHealthCard />
          </aside>
        </section>
      </div>
    </main>
  )
}

function EmptyBacklogState({ filter }: { filter: TaskListStatus }) {
  if (filter === 'completed') {
    return (
      <section className="backlog-state-card">
        <div className="section-tag">Completed</div>
        <h3>No completed tasks yet.</h3>
        <p>Finish something from the open backlog and it will appear here for review.</p>
      </section>
    )
  }

  if (filter === 'all') {
    return (
      <section className="backlog-state-card">
        <div className="section-tag">All tasks</div>
        <h3>Your backlog is still empty.</h3>
        <p>Start by capturing the first task above so the list has something to organize.</p>
      </section>
    )
  }

  return (
    <section className="backlog-state-card">
      <div className="section-tag">Open backlog</div>
      <h3>Nothing is waiting right now.</h3>
      <p>
        Add a task above to begin building the backlog you can later narrow into
        the current focus session.
      </p>
    </section>
  )
}
