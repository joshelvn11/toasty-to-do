import { requestJson } from './api-client.ts'

export type TaskList = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

type TaskListsResponse = {
  lists: TaskList[]
}

type TaskListResponse = {
  list: TaskList
}

export async function listTaskLists(signal?: AbortSignal): Promise<TaskList[]> {
  const response = await requestJson<TaskListsResponse>('/api/lists', {
    signal,
  })

  return response.lists
}

export async function createTaskList(input: { name: string }): Promise<TaskList> {
  const response = await requestJson<TaskListResponse>('/api/lists', {
    method: 'POST',
    body: input,
  })

  return response.list
}

export async function updateTaskList(
  listId: string,
  input: { name: string },
): Promise<TaskList> {
  const response = await requestJson<TaskListResponse>(`/api/lists/${listId}`, {
    method: 'PATCH',
    body: input,
  })

  return response.list
}

export async function deleteTaskList(listId: string): Promise<void> {
  await requestJson(`/api/lists/${listId}`, {
    method: 'DELETE',
  })
}
