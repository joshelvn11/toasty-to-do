import { Hono } from 'hono'
import { parseJsonBody, requireUserId } from '../lib/route-utils.js'
import {
  createTaskList,
  deleteTaskList,
  listTaskLists,
  updateTaskList,
  type CreateTaskListInput,
  type UpdateTaskListInput,
} from './task-list-service.js'

export const taskListRoutes = new Hono()

taskListRoutes.get('/', async (c) => {
  const userId = await requireUserId(c)

  return c.json({
    lists: listTaskLists(userId),
  })
})

taskListRoutes.post('/', async (c) => {
  const userId = await requireUserId(c)
  const body = await parseJsonBody<CreateTaskListInput>(c)
  const list = createTaskList(userId, body)

  return c.json({ list }, 201)
})

taskListRoutes.patch('/:listId', async (c) => {
  const userId = await requireUserId(c)
  const body = await parseJsonBody<UpdateTaskListInput>(c)
  const list = updateTaskList(userId, c.req.param('listId'), body)

  return c.json({ list })
})

taskListRoutes.delete('/:listId', async (c) => {
  const userId = await requireUserId(c)
  deleteTaskList(userId, c.req.param('listId'))

  return c.body(null, 204)
})
