import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOutIcon } from 'lucide-react'
import { ApiHealthCard } from '@/components/api-health-card'
import { BacklogPanel } from '@/components/backlog-panel'
import { FocusSessionPanel } from '@/components/focus-session-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
      <header className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Protected workspace</Badge>
            <Badge variant={currentFocusSession ? 'default' : 'secondary'}>
              {currentFocusSession ? 'Focus session active' : 'No active focus'}
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {auth.user.name}&apos;s backlog and focus
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Keep the full list visible, then pull only a few tasks into the current
              focus so the next action stays obvious.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/">Public home</Link>
          </Button>
          <Button disabled={isSigningOut} onClick={handleSignOut} type="button" variant="outline">
            <LogOutIcon />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <BacklogPanel
          createErrorMessage={createErrorMessage}
          currentFocusTaskCount={activeFocusTaskCount}
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

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle>Current user</CardTitle>
                  <CardDescription>{auth.user.email}</CardDescription>
                </div>
                <Badge variant="outline">Signed in</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{auth.user.name}</p>
                <p className="text-muted-foreground">
                  Session expires {new Date(auth.session.expiresAt).toLocaleString()}
                </p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Workflow split</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Backlog stays the full source list for every task you own</li>
                  <li>Focus sessions pull a temporary working set from backlog tasks</li>
                  <li>Completing work in focus still updates the same canonical task record</li>
                  <li>Returning a task removes it from focus without deleting it from backlog</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <ApiHealthCard />
        </aside>
      </section>
    </main>
  )
}
