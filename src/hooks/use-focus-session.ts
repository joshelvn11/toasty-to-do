import { useEffect, useState } from 'react'
import { isApiError } from '@/lib/api-client'
import {
  addTaskToFocusSession as addTaskToFocusSessionRequest,
  completeFocusSessionTask as completeFocusSessionTaskRequest,
  createFocusSession as createFocusSessionRequest,
  endFocusSession as endFocusSessionRequest,
  getCurrentFocusSession,
  removeTaskFromFocusSession as removeTaskFromFocusSessionRequest,
  type FocusSession,
} from '../lib/focus-session-api.ts'

export type FocusSessionMutationError =
  | {
      scope: 'start'
      message: string
    }
  | {
      scope: 'session'
      action: 'end'
      message: string
    }
  | {
      scope: 'task'
      action: 'add' | 'remove' | 'complete'
      taskId: string
      message: string
    }

function getErrorMessage(error: unknown, fallback: string) {
  if (isApiError(error) && error.status === 401) {
    return 'Your session has ended. Redirecting you to sign in.'
  }

  return error instanceof Error ? error.message : fallback
}

export function useFocusSession() {
  const [session, setSession] = useState<FocusSession | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mutationError, setMutationError] =
    useState<FocusSessionMutationError | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [pendingSessionAction, setPendingSessionAction] = useState<'end' | null>(null)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [pendingTaskAction, setPendingTaskAction] = useState<
    'add' | 'remove' | 'complete' | null
  >(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  function prepareForLoad() {
    setIsLoading(true)
    setLoadError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function runLoad() {
      try {
        const nextSession = await getCurrentFocusSession(controller.signal)

        if (!isActive || controller.signal.aborted) {
          return
        }

        setSession(nextSession)
      } catch (error) {
        if (!isActive || controller.signal.aborted) {
          return
        }

        setLoadError(
          getErrorMessage(error, 'Unable to load your focus session right now.'),
        )
      }

      if (!isActive || controller.signal.aborted) {
        return
      }

      setHasLoadedOnce(true)
      setIsLoading(false)
    }

    void runLoad()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [reloadVersion])

  function reload() {
    prepareForLoad()
    setReloadVersion((current) => current + 1)
  }

  async function startSession(input: { durationMinutes: number | null }) {
    setMutationError(null)
    setIsStarting(true)

    try {
      const createdSession = await createFocusSessionRequest({
        durationMinutes: input.durationMinutes,
      })

      setSession(createdSession)
      return createdSession
    } catch (error) {
      setMutationError({
        scope: 'start',
        message: getErrorMessage(
          error,
          'Unable to start a focus session right now.',
        ),
      })

      return null
    } finally {
      setIsStarting(false)
    }
  }

  async function endSession(sessionId: string) {
    setMutationError(null)
    setPendingSessionAction('end')

    try {
      await endFocusSessionRequest(sessionId)
      setSession(null)

      return true
    } catch (error) {
      setMutationError({
        scope: 'session',
        action: 'end',
        message: getErrorMessage(error, 'Unable to end this focus session right now.'),
      })

      return false
    } finally {
      setPendingSessionAction(null)
    }
  }

  async function addTaskToSession(sessionId: string, taskId: string) {
    setMutationError(null)
    setPendingTaskId(taskId)
    setPendingTaskAction('add')

    try {
      const updatedSession = await addTaskToFocusSessionRequest(sessionId, taskId)
      setSession(updatedSession)

      return true
    } catch (error) {
      setMutationError({
        scope: 'task',
        action: 'add',
        taskId,
        message: getErrorMessage(error, 'Unable to pull that task into focus right now.'),
      })

      return false
    } finally {
      setPendingTaskId(null)
      setPendingTaskAction(null)
    }
  }

  async function removeTaskFromSession(sessionId: string, taskId: string) {
    setMutationError(null)
    setPendingTaskId(taskId)
    setPendingTaskAction('remove')

    try {
      const updatedSession = await removeTaskFromFocusSessionRequest(sessionId, taskId)
      setSession(updatedSession)

      return true
    } catch (error) {
      setMutationError({
        scope: 'task',
        action: 'remove',
        taskId,
        message: getErrorMessage(
          error,
          'Unable to return that task to the backlog right now.',
        ),
      })

      return false
    } finally {
      setPendingTaskId(null)
      setPendingTaskAction(null)
    }
  }

  async function completeTaskInSession(sessionId: string, taskId: string) {
    setMutationError(null)
    setPendingTaskId(taskId)
    setPendingTaskAction('complete')

    try {
      const updatedSession = await completeFocusSessionTaskRequest(sessionId, taskId)
      setSession(updatedSession)

      return true
    } catch (error) {
      setMutationError({
        scope: 'task',
        action: 'complete',
        taskId,
        message: getErrorMessage(
          error,
          'Unable to complete that focus task right now.',
        ),
      })

      return false
    } finally {
      setPendingTaskId(null)
      setPendingTaskAction(null)
    }
  }

  return {
    session,
    hasLoadedOnce,
    isLoading,
    loadError,
    mutationError,
    isStarting,
    pendingSessionAction,
    pendingTaskId,
    pendingTaskAction,
    reload,
    startSession,
    endSession,
    addTaskToSession,
    removeTaskFromSession,
    completeTaskInSession,
  }
}
