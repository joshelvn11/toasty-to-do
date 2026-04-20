export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_LIST_STATUSES = ['open', 'completed', 'all'] as const

export type TaskListStatus = (typeof TASK_LIST_STATUSES)[number]

export type Task = {
  id: string
  title: string
  priority: TaskPriority
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

type TaskListResponse = {
  tasks: Task[]
}

type TaskResponse = {
  task: Task
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: Record<string, unknown>
  signal?: AbortSignal
}

type ApiErrorPayload = {
  error?: string
}

async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body
      ? {
          'Content-Type': 'application/json',
        }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const payload = (await response.json().catch(() => null)) as T | ApiErrorPayload | null

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed with ${response.status}.`

    throw new Error(message)
  }

  return payload as T
}

export async function listTasks(
  status: TaskListStatus,
  signal?: AbortSignal,
): Promise<Task[]> {
  const response = await requestJson<TaskListResponse>(
    `/api/tasks?status=${encodeURIComponent(status)}`,
    {
      signal,
    },
  )

  return response.tasks
}

export async function createTask(input: {
  title: string
  priority: TaskPriority
}): Promise<Task> {
  const response = await requestJson<TaskResponse>('/api/tasks', {
    method: 'POST',
    body: input,
  })

  return response.task
}

export async function updateTask(
  taskId: string,
  input: {
    title: string
    priority: TaskPriority
  },
): Promise<Task> {
  const response = await requestJson<TaskResponse>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: input,
  })

  return response.task
}

export async function completeTask(taskId: string): Promise<Task> {
  const response = await requestJson<TaskResponse>(
    `/api/tasks/${taskId}/complete`,
    {
      method: 'POST',
    },
  )

  return response.task
}

export async function reopenTask(taskId: string): Promise<Task> {
  const response = await requestJson<TaskResponse>(`/api/tasks/${taskId}/reopen`, {
    method: 'POST',
  })

  return response.task
}
