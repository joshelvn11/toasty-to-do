import { requestJson } from './api-client.ts'
import type { Task } from './task-api.ts'

export type FocusSessionStatus = 'active' | 'ended'

export type FocusSessionTask = Task & {
  addedToSessionAt: string
}

export type FocusSession = {
  id: string
  durationMinutes: number | null
  status: FocusSessionStatus
  startedAt: string
  endedAt: string | null
  createdAt: string
  updatedAt: string
  tasks: FocusSessionTask[]
}

type NullableFocusSessionResponse = {
  session: FocusSession | null
}

type FocusSessionResponse = {
  session: FocusSession
}

function requireSession(
  response: NullableFocusSessionResponse | FocusSessionResponse,
): FocusSession {
  if (!response.session) {
    throw new Error('Focus session response did not include a session.')
  }

  return response.session
}

export async function getCurrentFocusSession(
  signal?: AbortSignal,
): Promise<FocusSession | null> {
  const response = await requestJson<NullableFocusSessionResponse>(
    '/api/focus-sessions/current',
    {
      signal,
    },
  )

  return response.session
}

export async function createFocusSession(input: {
  durationMinutes?: number | null
}): Promise<FocusSession> {
  const response = await requestJson<FocusSessionResponse>('/api/focus-sessions', {
    method: 'POST',
    body:
      input.durationMinutes === undefined || input.durationMinutes === null
        ? {}
        : {
            durationMinutes: input.durationMinutes,
          },
  })

  return requireSession(response)
}

export async function endFocusSession(sessionId: string): Promise<FocusSession> {
  const response = await requestJson<FocusSessionResponse>(
    `/api/focus-sessions/${sessionId}/end`,
    {
      method: 'POST',
    },
  )

  return requireSession(response)
}

export async function addTaskToFocusSession(
  sessionId: string,
  taskId: string,
): Promise<FocusSession> {
  const response = await requestJson<FocusSessionResponse>(
    `/api/focus-sessions/${sessionId}/tasks`,
    {
      method: 'POST',
      body: {
        taskId,
      },
    },
  )

  return requireSession(response)
}

export async function removeTaskFromFocusSession(
  sessionId: string,
  taskId: string,
): Promise<FocusSession> {
  const response = await requestJson<FocusSessionResponse>(
    `/api/focus-sessions/${sessionId}/tasks/${taskId}`,
    {
      method: 'DELETE',
    },
  )

  return requireSession(response)
}

export async function completeFocusSessionTask(
  sessionId: string,
  taskId: string,
): Promise<FocusSession> {
  const response = await requestJson<FocusSessionResponse>(
    `/api/focus-sessions/${sessionId}/tasks/${taskId}/complete`,
    {
      method: 'POST',
    },
  )

  return requireSession(response)
}
