import { useEffect, useState } from 'react'
import {
  completeTask as completeTaskRequest,
  createTask as createTaskRequest,
  listTasks,
  reopenTask as reopenTaskRequest,
  TASK_LIST_STATUSES,
  updateTask as updateTaskRequest,
  type Task,
  type TaskListStatus,
  type TaskPriority,
} from '../lib/task-api.ts'

export type BacklogMutationError =
  | {
      scope: 'create'
      message: string
    }
  | {
      scope: 'task'
      taskId: string
      message: string
    }

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function useBacklog() {
  const [filter, setFilter] = useState<TaskListStatus>(TASK_LIST_STATUSES[0])
  const [tasks, setTasks] = useState<Task[]>([])
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<BacklogMutationError | null>(
    null,
  )
  const [isCreating, setIsCreating] = useState(false)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  function prepareForLoad() {
    setIsLoading(true)
    setLoadError(null)
    setTasks([])
  }

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    async function runLoad() {
      try {
        const nextTasks = await listTasks(filter, controller.signal)

        if (!isActive || controller.signal.aborted) {
          return
        }

        setTasks(nextTasks)
      } catch (error) {
        if (!isActive || controller.signal.aborted) {
          return
        }

        setLoadError(getErrorMessage(error, 'Unable to load your backlog right now.'))
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
  }, [filter, reloadVersion])

  function reload() {
    prepareForLoad()
    setReloadVersion((current) => current + 1)
  }

  function changeFilter(nextFilter: TaskListStatus) {
    if (nextFilter === filter) {
      return
    }

    prepareForLoad()
    setFilter(nextFilter)
  }

  async function createTask(input: { title: string; priority: TaskPriority }) {
    setMutationError(null)
    setIsCreating(true)

    try {
      await createTaskRequest(input)

      if (filter !== 'open') {
        changeFilter('open')
      } else {
        reload()
      }

      return true
    } catch (error) {
      setMutationError({
        scope: 'create',
        message: getErrorMessage(error, 'Unable to add that task right now.'),
      })

      return false
    } finally {
      setIsCreating(false)
    }
  }

  async function updateTask(taskId: string, input: {
    title: string
    priority: TaskPriority
  }) {
    setMutationError(null)
    setPendingTaskId(taskId)

    try {
      await updateTaskRequest(taskId, input)
      reload()

      return true
    } catch (error) {
      setMutationError({
        scope: 'task',
        taskId,
        message: getErrorMessage(error, 'Unable to save that task right now.'),
      })

      return false
    } finally {
      setPendingTaskId(null)
    }
  }

  async function completeTask(taskId: string) {
    setMutationError(null)
    setPendingTaskId(taskId)

    try {
      await completeTaskRequest(taskId)
      reload()

      return true
    } catch (error) {
      setMutationError({
        scope: 'task',
        taskId,
        message: getErrorMessage(error, 'Unable to complete that task right now.'),
      })

      return false
    } finally {
      setPendingTaskId(null)
    }
  }

  async function reopenTask(taskId: string) {
    setMutationError(null)
    setPendingTaskId(taskId)

    try {
      await reopenTaskRequest(taskId)
      reload()

      return true
    } catch (error) {
      setMutationError({
        scope: 'task',
        taskId,
        message: getErrorMessage(error, 'Unable to reopen that task right now.'),
      })

      return false
    } finally {
      setPendingTaskId(null)
    }
  }

  return {
    filter,
    setFilter: changeFilter,
    tasks,
    hasLoadedOnce,
    isLoading,
    loadError,
    reload,
    mutationError,
    isCreating,
    pendingTaskId,
    createTask,
    updateTask,
    completeTask,
    reopenTask,
  }
}
