import { Hono } from 'hono'
import { parseJsonBody, requireUserId } from '../lib/route-utils.js'
import {
  completeTask,
  createTask,
  listTasks,
  reopenTask,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from './task-service.js'

export const taskRoutes = new Hono()

taskRoutes.get('/', async (c) => {
  const userId = await requireUserId(c)
  const result = listTasks(userId, c.req.query('status'))

  return c.json({
    tasks: result.tasks,
  })
})

taskRoutes.post('/', async (c) => {
  const userId = await requireUserId(c)
  const body = await parseJsonBody<CreateTaskInput>(c)
  const task = createTask(userId, body)

  return c.json(
    {
      task,
    },
    201,
  )
})

taskRoutes.patch('/:taskId', async (c) => {
  const userId = await requireUserId(c)
  const body = await parseJsonBody<UpdateTaskInput>(c)
  const task = updateTask(userId, c.req.param('taskId'), body)

  return c.json({
    task,
  })
})

taskRoutes.post('/:taskId/complete', async (c) => {
  const userId = await requireUserId(c)
  const task = completeTask(userId, c.req.param('taskId'))

  return c.json({
    task,
  })
})

taskRoutes.post('/:taskId/reopen', async (c) => {
  const userId = await requireUserId(c)
  const task = reopenTask(userId, c.req.param('taskId'))

  return c.json({
    task,
  })
})
