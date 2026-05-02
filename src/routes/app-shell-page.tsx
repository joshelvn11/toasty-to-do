import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOutIcon } from 'lucide-react'
import { BacklogPanel } from '@/components/backlog-panel'
import { FocusSessionPanel } from '@/components/focus-session-panel'
import { Button } from '@/components/ui/button'
import { useAuthState } from '@/hooks/use-auth-state'
import { useBacklog } from '@/hooks/use-backlog'
import { useFocusSession } from '@/hooks/use-focus-session'
import { authClient } from '@/lib/auth-client'
import type { Task, TaskPriority } from '@/lib/task-api'

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
  const [queuedFocusTaskIds, setQueuedFocusTaskIds] = useState<string[]>([])

  if (auth.status !== 'authenticated') {
    return null
  }

  const currentFocusSession = focusSession.session
  const focusTaskIds = new Set([
    ...(currentFocusSession?.tasks.map((task) => task.id) ?? []),
    ...(!currentFocusSession ? queuedFocusTaskIds : []),
  ])
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
    const createdSession = await focusSession.startSession({ durationMinutes })

    if (!createdSession) {
      return false
    }

    for (const taskId of queuedFocusTaskIds) {
      await focusSession.addTaskToSession(createdSession.id, taskId)
    }

    setQueuedFocusTaskIds([])
    return true
  }

  async function handleEndFocusSession() {
    if (!currentFocusSession) {
      return
    }

    await focusSession.endSession(currentFocusSession.id)
  }

  async function handleAddTaskToFocus(taskId: string) {
    if (!currentFocusSession) {
      setQueuedFocusTaskIds((current) =>
        current.includes(taskId)
          ? current.filter((queuedTaskId) => queuedTaskId !== taskId)
          : [...current, taskId],
      )
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

  function getBacklogTaskError(taskId: string) {
    return backlog.mutationError?.scope === 'task' &&
      backlog.mutationError.taskId === taskId
      ? backlog.mutationError.message
      : null
  }

  const createErrorMessage =
    createValidationError ??
    (backlog.mutationError?.scope === 'create' ? backlog.mutationError.message : null)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <header className="flex justify-end">
        <Button disabled={isSigningOut} onClick={handleSignOut} type="button" variant="outline">
          <LogOutIcon />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <BacklogPanel
          createErrorMessage={createErrorMessage}
          editPriority={editPriority}
          editTitle={editTitle}
          editingTaskId={editingTaskId}
          editValidationError={editValidationError}
          filter={backlog.filter}
          focusTaskIds={focusTaskIds}
          getBacklogTaskError={getBacklogTaskError}
          getFocusTaskError={getFocusTaskError}
          hasActiveFocusSession={Boolean(currentFocusSession)}
          isAnyFocusActionPending={isAnyFocusActionPending}
          isCreating={backlog.isCreating}
          isLoading={backlog.isLoading}
          loadError={backlog.loadError}
          newTaskPriority={newTaskPriority}
          newTaskTitle={newTaskTitle}
          onAddTaskToFocus={handleAddTaskToFocus}
          onBeginEdit={beginEdit}
          onCancelEdit={cancelEdit}
          onCreateTask={handleCreateTask}
          onEditPriorityChange={setEditPriority}
          onEditTitleChange={(value) => {
            setEditTitle(value)
            if (editValidationError) {
              setEditValidationError(null)
            }
          }}
          onFilterChange={(status) => {
            cancelEdit()
            backlog.setFilter(status)
          }}
          onNewTaskPriorityChange={setNewTaskPriority}
          onNewTaskTitleChange={(value) => {
            setNewTaskTitle(value)
            if (createValidationError) {
              setCreateValidationError(null)
            }
          }}
          onRetry={backlog.reload}
          onSaveEdit={handleSaveEdit}
          onToggleTask={handleToggleTask}
          pendingTaskId={backlog.pendingTaskId}
          tasks={backlog.tasks}
        />

        <aside className="space-y-6">
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
            pendingTaskId={focusSession.pendingTaskId}
            session={currentFocusSession}
            sessionError={sessionError}
            startError={startError}
          />
        </aside>
      </section>
    </main>
  )
}
