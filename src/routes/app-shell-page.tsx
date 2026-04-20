import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'
import { useBacklog } from '../hooks/use-backlog.ts'
import { useAuthState } from '../hooks/use-auth-state.ts'
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

    cancelEdit()
  }

  async function handleToggleTask(task: Task) {
    const succeeded = task.completedAt
      ? await backlog.reopenTask(task.id)
      : await backlog.completeTask(task.id)

    if (succeeded && editingTaskId === task.id) {
      cancelEdit()
    }
  }

  const createErrorMessage =
    createValidationError ??
    (backlog.mutationError?.scope === 'create' ? backlog.mutationError.message : null)

  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="app-topbar">
          <div className="brand-block">
            <div className="brand-mark">Authenticated workspace</div>
            <h1 className="brand-title">{auth.user.name}'s backlog</h1>
            <p className="brand-copy">
              Capture everything that matters, keep the priorities lightweight,
              and let the focus-session workflow stay intentionally separate
              until the next phase.
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
              Add to the backlog quickly, adjust priority in place, and mark
              work complete without turning the app into a project board.
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

              <span className={`status-pill ${backlog.isLoading ? 'loading' : 'ready'}`}>
                {backlog.isLoading
                  ? 'Loading tasks'
                  : `${backlog.tasks.length} ${
                      backlog.tasks.length === 1 ? 'task' : 'tasks'
                    }`}
              </span>
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
                    const isBusy = backlog.pendingTaskId === task.id
                    const taskError =
                      backlog.mutationError?.scope === 'task' &&
                      backlog.mutationError.taskId === task.id
                        ? backlog.mutationError.message
                        : null

                    return (
                      <li
                        key={task.id}
                        className={`task-card ${task.completedAt ? 'is-completed' : ''}`}
                      >
                        {isEditing ? (
                          <div className="task-edit-grid">
                            <label className="field backlog-field backlog-title-field">
                              <span>Edit title</span>
                              <input
                                className="field-input"
                                disabled={isBusy}
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
                                disabled={isBusy}
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
                                disabled={isBusy}
                                onClick={() => void handleSaveEdit(task.id)}
                                type="button"
                              >
                                {isBusy ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                className="secondary-button"
                                disabled={isBusy}
                                onClick={cancelEdit}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>

                            {editValidationError ? (
                              <p className="form-message error">{editValidationError}</p>
                            ) : null}

                            {taskError ? <p className="form-message error">{taskError}</p> : null}
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
                              <button
                                className={task.completedAt ? 'secondary-button' : 'button-link'}
                                disabled={Boolean(backlog.pendingTaskId)}
                                onClick={() => void handleToggleTask(task)}
                                type="button"
                              >
                                {isBusy
                                  ? task.completedAt
                                    ? 'Reopening...'
                                    : 'Completing...'
                                  : task.completedAt
                                    ? 'Reopen'
                                    : 'Complete'}
                              </button>
                            </div>

                            {taskError ? <p className="form-message error">{taskError}</p> : null}
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
            <ApiHealthCard />

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
                  <div className="eyebrow">What comes next</div>
                  <h3>Focus session stays intentionally separate</h3>
                </div>
                <span className="status-pill ready">Ready</span>
              </header>

              <p>
                The backlog is now live. The next phase can turn a small slice
                of this list into a deliberate working session without creating
                duplicate task records.
              </p>

              <div className="placeholder-note">
                <strong>Phase 5 target</strong>
                Session creation, optional duration, and moving tasks into and
                out of the active focus set will land here next.
              </div>
            </section>

            <section className="status-card">
              <header>
                <div>
                  <div className="eyebrow">Backlog behavior</div>
                  <h3>Phase 4 status</h3>
                </div>
                <span className="status-pill ready">Live</span>
              </header>

              <ul className="status-list">
                <li>New tasks default to medium priority unless you choose otherwise</li>
                <li>Open, completed, and all-task views stay scoped to the signed-in user</li>
                <li>Task edits and completion changes are saved through the authenticated API</li>
                <li>Focus-session interactions remain out of scope for this phase</li>
              </ul>
            </section>
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
      <p>Add a task above to begin building the backlog you can later narrow into focus.</p>
    </section>
  )
}
