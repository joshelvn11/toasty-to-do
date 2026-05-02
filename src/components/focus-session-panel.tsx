import { type FormEvent, type ReactNode, useState } from 'react'
import { AlertCircleIcon, CheckIcon, Clock3Icon, TimerIcon, Undo2Icon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TaskPriorityBadge } from '@/components/task-priority-badge'
import type { FocusSession } from '@/lib/focus-session-api'

type FocusSessionPanelProps = {
  session: FocusSession | null
  isLoading: boolean
  loadError: string | null
  isStarting: boolean
  pendingSessionAction: 'end' | null
  pendingTaskId: string | null
  startError: string | null
  sessionError: string | null
  getTaskError: (taskId: string) => string | null
  onRetry: () => void
  onStartSession: (durationMinutes: number | null) => Promise<boolean> | boolean
  onEndSession: () => Promise<void> | void
  onCompleteTask: (taskId: string) => Promise<void> | void
  onRemoveTask: (taskId: string) => Promise<void> | void
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
  const remainingMinutes =
    !session || session.durationMinutes === null
      ? null
      : Math.max(
          0,
          Math.ceil(
            (new Date(session.startedAt).getTime() +
              session.durationMinutes * 60_000 -
              Date.now()) /
              60_000,
          ),
        )

  const isBusy = isStarting || pendingSessionAction === 'end' || Boolean(pendingTaskId)

  return (
    <Card className="border-border/70 shadow-sm" aria-live="polite">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Current focus
            </p>
          </div>
          <Badge variant={loadError ? 'destructive' : session ? 'default' : 'secondary'}>
            {loadError ? 'Error' : isLoading ? 'Loading' : session ? 'Active' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loadError ? (
          <StateMessage
            action={
              <Button onClick={onRetry} type="button" variant="outline">
                Try again
              </Button>
            }
            description={loadError}
            icon={AlertCircleIcon}
            title="We could not load the current focus session."
          />
        ) : null}

        {!loadError && session ? (
          <>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]">
              <MetricCard
                label="Duration"
                value={
                  session.durationMinutes === null
                    ? 'Open-ended'
                    : `${session.durationMinutes} min`
                }
              />
              <MetricCard
                label="Time remaining"
                value={remainingMinutes === null ? 'Open-ended' : `${remainingMinutes} min`}
              />
              <MetricCard label="Open in focus" value={String(activeTaskCount)} />
              <MetricCard label="Completed here" value={String(completedTaskCount)} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TimerIcon className="size-4" />
                <span>
                  {sessionEndsAt
                    ? `Timebox ends at ${formatTime(sessionEndsAt)}`
                    : 'No time limit set for this session'}
                </span>
              </div>

              <Button
                disabled={isBusy}
                onClick={() => void onEndSession()}
                type="button"
                variant="outline"
              >
                {pendingSessionAction === 'end' ? 'Ending...' : 'End session'}
              </Button>
            </div>

            {sessionError ? (
              <InlineAlert message={sessionError} title="Could not update session" />
            ) : null}

            {session.tasks.length === 0 ? (
              <StateMessage
                description="Use the backlog actions to add a few open tasks here and keep the current working set intentionally small."
                icon={Clock3Icon}
                title="No tasks are in this session yet."
              />
            ) : (
              <div className="space-y-3">
                {session.tasks.map((task) => {
                  const taskError = getTaskError(task.id)

                  return (
                    <Card
                      key={task.id}
                      className={task.completedAt ? 'border-border/70 bg-muted/25 shadow-none' : 'border-border/70 shadow-none'}
                      size="sm"
                    >
                      <CardContent className="space-y-4 px-4 py-3">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <h3 className="text-base font-medium">{task.title}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <TaskPriorityBadge priority={task.priority} />
                              <Badge variant="secondary">In focus</Badge>
                              {task.completedAt ? <Badge variant="outline">Completed</Badge> : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {!task.completedAt ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    disabled={isBusy}
                                    onClick={() => void onCompleteTask(task.id)}
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label="Complete task"
                                  >
                                    <CheckIcon className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Complete task</TooltipContent>
                              </Tooltip>
                            ) : null}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  disabled={isBusy}
                                  onClick={() => void onRemoveTask(task.id)}
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  aria-label={task.completedAt ? 'Remove from focus' : 'Return to backlog'}
                                >
                                  {task.completedAt ? (
                                    <XIcon className="size-4" />
                                  ) : (
                                    <Undo2Icon className="size-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {task.completedAt ? 'Remove from focus' : 'Return to backlog'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {taskError ? <Separator /> : null}
                        {taskError ? (
                          <InlineAlert message={taskError} title="Could not update focus task" />
                        ) : null}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        ) : null}

        {!loadError && !session ? (
          <>
            <form
              className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="focus-duration">Optional duration in minutes</Label>
                <Input
                  id="focus-duration"
                  disabled={isStarting}
                  inputMode="numeric"
                  onChange={(event) => {
                    setDurationInput(event.target.value)
                    if (validationError) {
                      setValidationError(null)
                    }
                  }}
                  placeholder="25"
                  type="text"
                  value={durationInput}
                />
                <p className="text-sm text-muted-foreground">
                  Leave blank for an open-ended session, or use a positive whole number.
                </p>
              </div>

              <Button
                className="w-full sm:w-auto"
                disabled={isStarting}
                type="submit"
                variant="outline"
              >
                {isStarting ? 'Starting...' : 'Start focus session'}
              </Button>

              {validationError ? (
                <InlineAlert message={validationError} title="Invalid duration" />
              ) : null}
              {startError ? (
                <InlineAlert message={startError} title="Could not start session" />
              ) : null}
            </form>

            <StateMessage
              description="Start a session when you are ready to narrow the backlog into a small working set."
              icon={Clock3Icon}
              title="No focus session is active right now."
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function InlineAlert({ message, title }: { message: string; title: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function StateMessage({
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
