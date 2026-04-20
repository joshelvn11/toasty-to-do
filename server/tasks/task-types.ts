export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_LIST_STATUSES = ['open', 'completed', 'all'] as const

export type TaskListStatus = (typeof TASK_LIST_STATUSES)[number]

export const DEFAULT_TASK_PRIORITY: TaskPriority = 'medium'

export function isTaskPriority(value: unknown): value is TaskPriority {
  return (
    typeof value === 'string' &&
    (TASK_PRIORITIES as readonly string[]).includes(value)
  )
}

export function isTaskListStatus(value: unknown): value is TaskListStatus {
  return (
    typeof value === 'string' &&
    (TASK_LIST_STATUSES as readonly string[]).includes(value)
  )
}
