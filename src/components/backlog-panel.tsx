import { type FormEvent, type ReactNode, useState } from 'react'
import {
  AlertCircleIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  CheckIcon,
  Clock3Icon,
  FolderIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { TaskPriorityBadge } from '@/components/task-priority-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TaskList } from '@/lib/task-list-api'
import { TASK_LIST_STATUSES, TASK_PRIORITIES } from '@/lib/task-api'
import type { Task, TaskListStatus, TaskPriority } from '@/lib/task-api'
import { cn } from '@/lib/utils'

const FILTER_LABELS: Record<TaskListStatus, string> = {
  open: 'Open',
  completed: 'Completed',
  all: 'All',
}

const UNASSIGNED_LIST_VALUE = 'unassigned'

type BacklogPanelProps = {
  filter: TaskListStatus
  tasks: Task[]
  lists: TaskList[]
  isLoading: boolean
  loadError: string | null
  isCreating: boolean
  pendingTaskId: string | null
  createErrorMessage: string | null
  listValidationError: string | null
  newListName: string
  newTaskTitle: string
  newTaskPriority: TaskPriority
  newTaskListId: string
  onNewTaskTitleChange: (value: string) => void
  onNewTaskPriorityChange: (value: TaskPriority) => void
  onNewTaskListIdChange: (value: string) => void
  onCreateTask: (event: FormEvent<HTMLFormElement>) => Promise<boolean | void> | boolean | void
  onCreateList: (event: FormEvent<HTMLFormElement>) => Promise<boolean | void> | boolean | void
  onNewListNameChange: (value: string) => void
  onFilterChange: (status: TaskListStatus) => void
  onRetry: () => void
  hasActiveFocusSession: boolean
  editingTaskId: string | null
  editTitle: string
  editPriority: TaskPriority
  editListId: string
  editValidationError: string | null
  onEditTitleChange: (value: string) => void
  onEditPriorityChange: (value: TaskPriority) => void
  onEditListIdChange: (value: string) => void
  onBeginEdit: (task: Task) => void
  onCancelEdit: () => void
  onSaveEdit: (taskId: string) => Promise<void> | void
  onToggleTask: (task: Task) => Promise<void> | void
  onAddTaskToFocus: (taskId: string) => Promise<void> | void
  focusTaskIds: Set<string>
  isAnyFocusActionPending: boolean
  getBacklogTaskError: (taskId: string) => string | null
  getFocusTaskError: (taskId: string) => string | null
  editingListId: string | null
  editListName: string
  editListValidationError: string | null
  onBeginListEdit: (listId: string, name: string) => void
  onCancelListEdit: () => void
  onEditListNameChange: (value: string) => void
  onSaveListEdit: (listId: string) => Promise<void> | void
  onDeleteList: (listId: string) => Promise<void> | void
  getListError: (listId: string) => string | null
}

type TaskGroup = {
  id: string
  name: string
  tasks: Task[]
  list: TaskList | null
}

export function BacklogPanel({
  filter,
  tasks,
  lists,
  isLoading,
  loadError,
  isCreating,
  pendingTaskId,
  createErrorMessage,
  listValidationError,
  newListName,
  newTaskTitle,
  newTaskPriority,
  newTaskListId,
  onNewTaskTitleChange,
  onNewTaskPriorityChange,
  onNewTaskListIdChange,
  onCreateTask,
  onCreateList,
  onNewListNameChange,
  onFilterChange,
  onRetry,
  hasActiveFocusSession,
  editingTaskId,
  editTitle,
  editPriority,
  editListId,
  editValidationError,
  onEditTitleChange,
  onEditPriorityChange,
  onEditListIdChange,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleTask,
  onAddTaskToFocus,
  focusTaskIds,
  isAnyFocusActionPending,
  getBacklogTaskError,
  getFocusTaskError,
  editingListId,
  editListName,
  editListValidationError,
  onBeginListEdit,
  onCancelListEdit,
  onEditListNameChange,
  onSaveListEdit,
  onDeleteList,
  getListError,
}: BacklogPanelProps) {
  const taskGroups = groupTasksByList(tasks, lists)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)

  async function handleTaskDialogSubmit(event: FormEvent<HTMLFormElement>) {
    const result = await onCreateTask(event)

    if (result !== false) {
      setIsTaskDialogOpen(false)
    }
  }

  async function handleListDialogSubmit(event: FormEvent<HTMLFormElement>) {
    const result = await onCreateList(event)

    if (result !== false) {
      setIsListDialogOpen(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Backlog
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog onOpenChange={setIsTaskDialogOpen} open={isTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isLoading} type="button" variant="outline">
                  <PlusIcon />
                  New task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Task</DialogTitle>
                  <DialogDescription>
                    Capture something for the backlog and optionally place it in a list.
                  </DialogDescription>
                </DialogHeader>

                <form
                  aria-label="Add a task"
                  className="space-y-4"
                  noValidate
                  onSubmit={handleTaskDialogSubmit}
                >
                  <div className="space-y-2">
                    <Label htmlFor="new-task-title">Task title</Label>
                    <Input
                      id="new-task-title"
                      disabled={isCreating || isLoading}
                      onChange={(event) => onNewTaskTitleChange(event.target.value)}
                      placeholder="Write down what needs doing"
                      value={newTaskTitle}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-task-list">List</Label>
                      <TaskListSelect
                        disabled={isCreating || isLoading}
                        inputId="new-task-list"
                        lists={lists}
                        onValueChange={onNewTaskListIdChange}
                        value={newTaskListId}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-task-priority">Priority</Label>
                      <PrioritySelect
                        disabled={isCreating || isLoading}
                        inputId="new-task-priority"
                        onValueChange={onNewTaskPriorityChange}
                        value={newTaskPriority}
                      />
                    </div>
                  </div>

                  {createErrorMessage ? (
                    <InlineAlert message={createErrorMessage} title="Could not add task" />
                  ) : null}

                  <DialogFooter>
                    <Button type="submit" disabled={isCreating || isLoading} variant="outline">
                      <PlusIcon />
                      {isCreating ? 'Adding...' : 'Add task'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog onOpenChange={setIsListDialogOpen} open={isListDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isLoading} type="button" variant="outline">
                  <FolderIcon />
                  New list
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Lists</DialogTitle>
                  <DialogDescription>
                    Create, rename, or remove the lightweight categories you use to group backlog tasks.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                  <form
                    aria-label="Create a list"
                    className="space-y-4"
                    noValidate
                    onSubmit={handleListDialogSubmit}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="new-list-name">List name</Label>
                      <Input
                        id="new-list-name"
                        disabled={isLoading}
                        onChange={(event) => onNewListNameChange(event.target.value)}
                        placeholder="Create a new list"
                        value={newListName}
                      />
                    </div>

                    {listValidationError ? (
                      <InlineAlert message={listValidationError} title="Could not create list" />
                    ) : null}

                    <DialogFooter>
                      <Button disabled={isLoading} type="submit" variant="outline">
                        <PlusIcon />
                        Add list
                      </Button>
                    </DialogFooter>
                  </form>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="size-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Current lists</h3>
                    </div>

                    {lists.length > 0 ? (
                      <div className="space-y-3">
                        {lists.map((list) => {
                          const isEditingList = editingListId === list.id
                          const listError = getListError(list.id)

                          return (
                            <div
                              key={list.id}
                              className="rounded-lg border border-border/70 bg-muted/20 px-3 py-3"
                            >
                              {isEditingList ? (
                                <div className="space-y-3">
                                  <Input
                                    aria-label={`Edit list ${list.name}`}
                                    onChange={(event) => onEditListNameChange(event.target.value)}
                                    value={editListName}
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      onClick={() => void onSaveListEdit(list.id)}
                                      type="button"
                                    >
                                      Save list
                                    </Button>
                                    <Button
                                      onClick={onCancelListEdit}
                                      type="button"
                                      variant="outline"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                  {editListValidationError ? (
                                    <InlineAlert
                                      message={editListValidationError}
                                      title="List name is required"
                                    />
                                  ) : null}
                                  {listError ? (
                                    <InlineAlert
                                      message={listError}
                                      title="Could not update list"
                                    />
                                  ) : null}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{list.name}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      aria-label={`Edit list ${list.name}`}
                                      onClick={() => onBeginListEdit(list.id, list.name)}
                                      size="icon"
                                      type="button"
                                      variant="outline"
                                    >
                                      <PencilIcon className="size-4" />
                                    </Button>
                                    <Button
                                      aria-label={`Delete list ${list.name}`}
                                      onClick={() => void onDeleteList(list.id)}
                                      size="icon"
                                      type="button"
                                      variant="outline"
                                    >
                                      <Trash2Icon className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Create a list to group related tasks while keeping the backlog lightweight.
                      </p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Tabs
            className="w-full md:w-auto"
            onValueChange={(value) => onFilterChange(value as TaskListStatus)}
            value={filter}
          >
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              {TASK_LIST_STATUSES.map((status) => (
                <TabsTrigger key={status} value={status}>
                  {FILTER_LABELS[status]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3Icon className="size-4" />
            <span>{isLoading ? 'Loading tasks...' : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`}</span>
          </div>
        </div>

        {loadError ? (
          <StateCard
            action={
              <Button onClick={onRetry} type="button" variant="outline">
                Try again
              </Button>
            }
            description={loadError}
            icon={AlertCircleIcon}
            title="We could not load your backlog."
          />
        ) : null}

        {!loadError && isLoading ? (
          <StateCard
            description="The backlog is loading through the authenticated task and list endpoints."
            icon={Clock3Icon}
            title="Pulling in your current backlog."
          />
        ) : null}

        {!loadError && !isLoading && tasks.length === 0 ? (
          <EmptyBacklogState filter={filter} />
        ) : null}

        {!loadError && !isLoading && tasks.length > 0 ? (
          <div className="space-y-5">
            {taskGroups.map((group) => (
              <section key={group.id} aria-label={`${group.name} tasks`} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{group.name}</h3>
                    <Badge variant="secondary">{group.tasks.length}</Badge>
                  </div>
                  {group.list ? (
                    <p className="text-xs text-muted-foreground">List section</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Tasks without a list</p>
                  )}
                </div>

                <div className="space-y-3">
                  {group.tasks.map((task) => {
                    const isEditing = editingTaskId === task.id
                    const isBacklogTaskBusy = pendingTaskId === task.id
                    const isInFocus = focusTaskIds.has(task.id)
                    const backlogTaskError = getBacklogTaskError(task.id)
                    const focusTaskError = getFocusTaskError(task.id)

                    return (
                      <Card
                        key={task.id}
                        className={cn(
                          'border-border/70 shadow-none',
                          task.completedAt && 'bg-muted/25',
                          isInFocus && 'ring-2 ring-primary/10',
                        )}
                        size="sm"
                      >
                        <CardContent className="space-y-4 px-4 py-3">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_180px]">
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-task-title-${task.id}`}>Edit title</Label>
                                  <Input
                                    id={`edit-task-title-${task.id}`}
                                    disabled={isBacklogTaskBusy}
                                    onChange={(event) => onEditTitleChange(event.target.value)}
                                    value={editTitle}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`edit-task-list-${task.id}`}>Edit list</Label>
                                  <TaskListSelect
                                    disabled={isBacklogTaskBusy}
                                    inputId={`edit-task-list-${task.id}`}
                                    lists={lists}
                                    onValueChange={onEditListIdChange}
                                    value={editListId}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`edit-task-priority-${task.id}`}>
                                    Edit priority
                                  </Label>
                                  <PrioritySelect
                                    disabled={isBacklogTaskBusy}
                                    inputId={`edit-task-priority-${task.id}`}
                                    onValueChange={onEditPriorityChange}
                                    value={editPriority}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  disabled={isBacklogTaskBusy}
                                  onClick={() => void onSaveEdit(task.id)}
                                  type="button"
                                >
                                  {isBacklogTaskBusy ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  disabled={isBacklogTaskBusy}
                                  onClick={onCancelEdit}
                                  type="button"
                                  variant="outline"
                                >
                                  Cancel
                                </Button>
                              </div>

                              {editValidationError ? (
                                <InlineAlert
                                  message={editValidationError}
                                  title="Task title is required"
                                />
                              ) : null}

                              {backlogTaskError ? (
                                <InlineAlert
                                  message={backlogTaskError}
                                  title="Could not save task"
                                />
                              ) : null}
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4
                                      className={cn(
                                        'text-base font-medium',
                                        task.completedAt &&
                                          'text-muted-foreground line-through',
                                      )}
                                    >
                                      {task.title}
                                    </h4>
                                    <TaskPriorityBadge priority={task.priority} />
                                    {isInFocus ? (
                                      <Badge variant="secondary">
                                        {task.completedAt ? 'Completed in focus' : 'In focus'}
                                      </Badge>
                                    ) : null}
                                    {task.completedAt ? (
                                      <Badge variant="outline">Completed</Badge>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        aria-label="Edit task"
                                        disabled={Boolean(pendingTaskId)}
                                        onClick={() => onBeginEdit(task)}
                                        size="icon"
                                        type="button"
                                        variant="outline"
                                      >
                                        <PencilIcon className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit task</TooltipContent>
                                  </Tooltip>

                                  {!task.completedAt ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          aria-label={
                                            hasActiveFocusSession
                                              ? isInFocus
                                                ? 'In focus'
                                                : 'Add to focus'
                                              : isInFocus
                                                ? 'Queued for focus'
                                                : 'Add to next focus'
                                          }
                                          disabled={
                                            hasActiveFocusSession &&
                                            (isInFocus ||
                                              Boolean(pendingTaskId) ||
                                              isAnyFocusActionPending)
                                          }
                                          onClick={() => void onAddTaskToFocus(task.id)}
                                          size="icon"
                                          type="button"
                                          variant="outline"
                                        >
                                          <CheckCheckIcon className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {hasActiveFocusSession
                                          ? isInFocus
                                            ? 'In focus'
                                            : 'Add to focus'
                                          : isInFocus
                                            ? 'Queued for focus'
                                            : 'Add to next focus'}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : null}

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        aria-label={
                                          task.completedAt ? 'Reopen task' : 'Complete task'
                                        }
                                        disabled={Boolean(pendingTaskId)}
                                        onClick={() => void onToggleTask(task)}
                                        size="icon"
                                        type="button"
                                        variant="outline"
                                      >
                                        {task.completedAt ? (
                                          <CheckCircle2Icon className="size-4" />
                                        ) : (
                                          <CheckIcon className="size-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {task.completedAt ? 'Reopen task' : 'Complete task'}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>

                              {(backlogTaskError || focusTaskError) ? <Separator /> : null}

                              {backlogTaskError ? (
                                <InlineAlert
                                  message={backlogTaskError}
                                  title="Could not update task"
                                />
                              ) : null}
                              {focusTaskError ? (
                                <InlineAlert
                                  message={focusTaskError}
                                  title="Could not update focus session"
                                />
                              ) : null}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function groupTasksByList(tasks: Task[], lists: TaskList[]): TaskGroup[] {
  const grouped = new Map<string, Task[]>()

  grouped.set(UNASSIGNED_LIST_VALUE, [])

  for (const list of lists) {
    grouped.set(list.id, [])
  }

  for (const task of tasks) {
    const key = task.list?.id ?? UNASSIGNED_LIST_VALUE
    const bucket = grouped.get(key)

    if (bucket) {
      bucket.push(task)
      continue
    }

    grouped.set(key, [task])
  }

  const groups: TaskGroup[] = [
    {
      id: UNASSIGNED_LIST_VALUE,
      name: 'Unassigned',
      tasks: grouped.get(UNASSIGNED_LIST_VALUE) ?? [],
      list: null,
    },
  ]

  for (const list of lists) {
    groups.push({
      id: list.id,
      name: list.name,
      tasks: grouped.get(list.id) ?? [],
      list,
    })
  }

  return groups.filter((group) => group.tasks.length > 0)
}

function PrioritySelect({
  disabled,
  inputId,
  onValueChange,
  value,
}: {
  disabled: boolean
  inputId: string
  onValueChange: (value: TaskPriority) => void
  value: TaskPriority
}) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(next) => onValueChange(next as TaskPriority)}
      value={value}
    >
      <SelectTrigger aria-label="Priority" className="w-full" id={inputId}>
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        {TASK_PRIORITIES.map((priority) => (
          <SelectItem key={priority} value={priority}>
            {priority[0]!.toUpperCase() + priority.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function TaskListSelect({
  disabled,
  inputId,
  lists,
  onValueChange,
  value,
}: {
  disabled: boolean
  inputId: string
  lists: TaskList[]
  onValueChange: (value: string) => void
  value: string
}) {
  return (
    <Select disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectTrigger aria-label="List" className="w-full" id={inputId}>
        <SelectValue placeholder="Choose a list" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED_LIST_VALUE}>Unassigned</SelectItem>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StateCard({
  action,
  description,
  icon: Icon,
  title,
}: {
  action?: ReactNode
  description: string
  icon: typeof AlertCircleIcon
  title: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {action ? <div>{action}</div> : null}
        </div>
      </div>
    </div>
  )
}

function InlineAlert({ message, title }: { message: string; title: string }) {
  return (
    <Alert className="md:col-span-full" variant="destructive">
      <AlertCircleIcon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function EmptyBacklogState({ filter }: { filter: TaskListStatus }) {
  if (filter === 'completed') {
    return (
      <StateCard
        description="Finish something from the open backlog and it will appear here for review."
        icon={CheckCircle2Icon}
        title="No completed tasks yet."
      />
    )
  }

  if (filter === 'all') {
    return (
      <StateCard
        description="Start by capturing the first task above so the list has something to organize."
        icon={PlusIcon}
        title="Your backlog is still empty."
      />
    )
  }

  return (
    <StateCard
      description="Add a task above to begin building the backlog you can later narrow into the current focus session."
      icon={Clock3Icon}
      title="Nothing is waiting right now."
    />
  )
}
