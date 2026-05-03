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

const UNASSIGNED_LIST_VALUE = 'unassigned'

export function AppShellPage() {
  const auth = useAuthState()
  const backlog = useBacklog()
  const focusSession = useFocusSession()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [newTaskListId, setNewTaskListId] = useState(UNASSIGNED_LIST_VALUE)
  const [createValidationError, setCreateValidationError] = useState<string | null>(
    null,
  )
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium')
  const [editListId, setEditListId] = useState(UNASSIGNED_LIST_VALUE)
  const [editValidationError, setEditValidationError] = useState<string | null>(null)
  const [queuedFocusTaskIds, setQueuedFocusTaskIds] = useState<string[]>([])
  const [newListName, setNewListName] = useState('')
  const [listValidationError, setListValidationError] = useState<string | null>(null)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editListName, setEditListName] = useState('')
  const [editListValidationError, setEditListValidationError] = useState<string | null>(
    null,
  )

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

  function normalizeSelectedListId(value: string) {
    return value === UNASSIGNED_LIST_VALUE ? null : value
  }

  function beginEdit(task: Task) {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditListId(task.list?.id ?? UNASSIGNED_LIST_VALUE)
    setEditValidationError(null)
  }

  function cancelEdit() {
    setEditingTaskId(null)
    setEditTitle('')
    setEditPriority('medium')
    setEditListId(UNASSIGNED_LIST_VALUE)
    setEditValidationError(null)
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = newTaskTitle.trim()

    if (!title) {
      setCreateValidationError('Give the task a title before adding it to the backlog.')
      return false
    }

    setCreateValidationError(null)

    const created = await backlog.createTask({
      title,
      priority: newTaskPriority,
      listId: normalizeSelectedListId(newTaskListId),
    })

    if (!created) {
      return false
    }

    setNewTaskTitle('')
    setNewTaskPriority('medium')
    setNewTaskListId(UNASSIGNED_LIST_VALUE)
    return true
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
      listId: normalizeSelectedListId(editListId),
    })

    if (!saved) {
      return
    }

    if (focusTaskIds.has(taskId)) {
      focusSession.reload()
    }

    cancelEdit()
  }

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = newListName.trim()

    if (!name) {
      setListValidationError('Give the list a name before creating it.')
      return false
    }

    setListValidationError(null)

    const created = await backlog.createTaskList(name)

    if (!created) {
      return false
    }

    setNewListName('')
    return true
  }

  function beginListEdit(listId: string, name: string) {
    setEditingListId(listId)
    setEditListName(name)
    setEditListValidationError(null)
  }

  function cancelListEdit() {
    setEditingListId(null)
    setEditListName('')
    setEditListValidationError(null)
  }

  async function handleSaveListEdit(listId: string) {
    const name = editListName.trim()

    if (!name) {
      setEditListValidationError('List name cannot be blank.')
      return
    }

    setEditListValidationError(null)

    const saved = await backlog.updateTaskList(listId, name)

    if (!saved) {
      return
    }

    cancelListEdit()
  }

  async function handleDeleteList(listId: string) {
    const deleted = await backlog.deleteTaskList(listId)

    if (!deleted) {
      return
    }

    if (newTaskListId === listId) {
      setNewTaskListId(UNASSIGNED_LIST_VALUE)
    }

    if (editListId === listId) {
      setEditListId(UNASSIGNED_LIST_VALUE)
    }

    if (editingListId === listId) {
      cancelListEdit()
    }
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

  function getListError(listId: string) {
    return backlog.mutationError?.scope === 'list' &&
      backlog.mutationError.listId === listId
      ? backlog.mutationError.message
      : null
  }

  const createErrorMessage =
    createValidationError ??
    (backlog.mutationError?.scope === 'create' ? backlog.mutationError.message : null)

  const listErrorMessage =
    listValidationError ??
    (backlog.mutationError?.scope === 'list' &&
    backlog.mutationError.action === 'create'
      ? backlog.mutationError.message
      : null)

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
          editListId={editListId}
          editListName={editListName}
          editPriority={editPriority}
          editTitle={editTitle}
          editingListId={editingListId}
          editingTaskId={editingTaskId}
          editListValidationError={editListValidationError}
          editValidationError={editValidationError}
          filter={backlog.filter}
          focusTaskIds={focusTaskIds}
          getBacklogTaskError={getBacklogTaskError}
          getFocusTaskError={getFocusTaskError}
          getListError={getListError}
          hasActiveFocusSession={Boolean(currentFocusSession)}
          isAnyFocusActionPending={isAnyFocusActionPending}
          isCreating={backlog.isCreating}
          isLoading={backlog.isLoading}
          lists={backlog.lists}
          listValidationError={listErrorMessage}
          loadError={backlog.loadError}
          newListName={newListName}
          newTaskListId={newTaskListId}
          newTaskPriority={newTaskPriority}
          newTaskTitle={newTaskTitle}
          onAddTaskToFocus={handleAddTaskToFocus}
          onBeginEdit={beginEdit}
          onBeginListEdit={beginListEdit}
          onCancelEdit={cancelEdit}
          onCancelListEdit={cancelListEdit}
          onCreateList={handleCreateList}
          onCreateTask={handleCreateTask}
          onDeleteList={handleDeleteList}
          onEditListIdChange={setEditListId}
          onEditListNameChange={(value) => {
            setEditListName(value)
            if (editListValidationError) {
              setEditListValidationError(null)
            }
          }}
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
          onNewListNameChange={(value) => {
            setNewListName(value)
            if (listValidationError) {
              setListValidationError(null)
            }
          }}
          onNewTaskListIdChange={setNewTaskListId}
          onNewTaskPriorityChange={setNewTaskPriority}
          onNewTaskTitleChange={(value) => {
            setNewTaskTitle(value)
            if (createValidationError) {
              setCreateValidationError(null)
            }
          }}
          onRetry={backlog.reload}
          onSaveEdit={handleSaveEdit}
          onSaveListEdit={handleSaveListEdit}
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
