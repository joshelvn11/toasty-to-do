import { type FormEvent, type ReactNode } from 'react'
import { AlertCircleIcon, CheckCircle2Icon, Clock3Icon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TaskPriorityBadge } from '@/components/task-priority-badge'
import type { Task, TaskListStatus, TaskPriority } from '@/lib/task-api'
import { TASK_LIST_STATUSES, TASK_PRIORITIES } from '@/lib/task-api'
import { cn } from '@/lib/utils'

const FILTER_LABELS: Record<TaskListStatus, string> = {
  open: 'Open',
  completed: 'Completed',
  all: 'All',
}

type BacklogPanelProps = {
  filter: TaskListStatus
  tasks: Task[]
  isLoading: boolean
  loadError: string | null
  isCreating: boolean
  pendingTaskId: string | null
  createErrorMessage: string | null
  newTaskTitle: string
  newTaskPriority: TaskPriority
  onNewTaskTitleChange: (value: string) => void
  onNewTaskPriorityChange: (value: TaskPriority) => void
  onCreateTask: (event: FormEvent<HTMLFormElement>) => Promise<void> | void
  onFilterChange: (status: TaskListStatus) => void
  onRetry: () => void
  currentFocusTaskCount: number
  hasActiveFocusSession: boolean
  editingTaskId: string | null
  editTitle: string
  editPriority: TaskPriority
  editValidationError: string | null
  onEditTitleChange: (value: string) => void
  onEditPriorityChange: (value: TaskPriority) => void
  onBeginEdit: (task: Task) => void
  onCancelEdit: () => void
  onSaveEdit: (taskId: string) => Promise<void> | void
  onToggleTask: (task: Task) => Promise<void> | void
  onAddTaskToFocus: (taskId: string) => Promise<void> | void
  focusTaskIds: Set<string>
  isAnyFocusActionPending: boolean
  getBacklogTaskError: (taskId: string) => string | null
  getFocusTaskError: (taskId: string) => string | null
}

export function BacklogPanel({
  filter,
  tasks,
  isLoading,
  loadError,
  isCreating,
  pendingTaskId,
  createErrorMessage,
  newTaskTitle,
  newTaskPriority,
  onNewTaskTitleChange,
  onNewTaskPriorityChange,
  onCreateTask,
  onFilterChange,
  onRetry,
  currentFocusTaskCount,
  hasActiveFocusSession,
  editingTaskId,
  editTitle,
  editPriority,
  editValidationError,
  onEditTitleChange,
  onEditPriorityChange,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleTask,
  onAddTaskToFocus,
  focusTaskIds,
  isAnyFocusActionPending,
  getBacklogTaskError,
  getFocusTaskError,
}: BacklogPanelProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Backlog
            </p>
            <CardTitle>Your full task list lives here</CardTitle>
            <CardDescription className="max-w-2xl">
              Capture everything in one place, then pull only a few open tasks into
              the current focus without creating duplicate records.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{FILTER_LABELS[filter]} view</Badge>
            <Badge variant={hasActiveFocusSession ? 'default' : 'secondary'}>
              {hasActiveFocusSession
                ? `${currentFocusTaskCount} in focus`
                : 'No active focus'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          aria-label="Add a task"
          className="grid gap-4 rounded-xl border border-border/70 bg-muted/30 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
          noValidate
          onSubmit={onCreateTask}
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

          <div className="space-y-2">
            <Label htmlFor="new-task-priority">Priority</Label>
            <PrioritySelect
              disabled={isCreating || isLoading}
              inputId="new-task-priority"
              onValueChange={onNewTaskPriorityChange}
              value={newTaskPriority}
            />
          </div>

          <div className="flex items-end">
            <Button className="w-full md:w-auto" disabled={isCreating || isLoading} type="submit">
              <PlusIcon />
              {isCreating ? 'Adding...' : 'Add task'}
            </Button>
          </div>

          {createErrorMessage ? (
            <InlineAlert message={createErrorMessage} title="Could not add task" />
          ) : null}
        </form>

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
            description="The backlog is loading through the authenticated /api/tasks endpoint."
            icon={Clock3Icon}
            title="Pulling in your current backlog."
          />
        ) : null}

        {!loadError && !isLoading && tasks.length === 0 ? (
          <EmptyBacklogState filter={filter} />
        ) : null}

        {!loadError && !isLoading && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
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
                  <CardContent className="space-y-4 pt-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
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
                          <InlineAlert message={backlogTaskError} title="Could not save task" />
                        ) : null}
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={cn(
                                  'text-base font-medium',
                                  task.completedAt && 'text-muted-foreground line-through',
                                )}
                              >
                                {task.title}
                              </h3>
                              <TaskPriorityBadge priority={task.priority} />
                              {isInFocus ? (
                                <Badge variant="secondary">
                                  {task.completedAt ? 'Completed in focus' : 'In focus'}
                                </Badge>
                              ) : null}
                              {task.completedAt ? <Badge variant="outline">Completed</Badge> : null}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Updated{' '}
                              {new Date(task.updatedAt).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              disabled={Boolean(pendingTaskId)}
                              onClick={() => onBeginEdit(task)}
                              type="button"
                              variant="outline"
                            >
                              Edit
                            </Button>

                            {hasActiveFocusSession && !task.completedAt ? (
                              <Button
                                disabled={isInFocus || Boolean(pendingTaskId) || isAnyFocusActionPending}
                                onClick={() => void onAddTaskToFocus(task.id)}
                                type="button"
                                variant="outline"
                              >
                                {isInFocus ? 'In focus' : 'Add to focus'}
                              </Button>
                            ) : null}

                            <Button
                              disabled={Boolean(pendingTaskId)}
                              onClick={() => void onToggleTask(task)}
                              type="button"
                              variant={task.completedAt ? 'outline' : 'default'}
                            >
                              {isBacklogTaskBusy
                                ? task.completedAt
                                  ? 'Reopening...'
                                  : 'Completing...'
                                : task.completedAt
                                  ? 'Reopen'
                                  : 'Complete'}
                            </Button>
                          </div>
                        </div>

                        {(backlogTaskError || focusTaskError) ? <Separator /> : null}

                        {backlogTaskError ? (
                          <InlineAlert message={backlogTaskError} title="Could not update task" />
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
        ) : null}
      </CardContent>
    </Card>
  )
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
    <Select disabled={disabled} onValueChange={(next) => onValueChange(next as TaskPriority)} value={value}>
      <SelectTrigger aria-label="Priority" id={inputId} className="w-full">
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
