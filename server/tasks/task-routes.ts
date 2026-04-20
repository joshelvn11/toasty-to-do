import { Hono } from 'hono'
import type { Context } from 'hono'
import { requireSession } from '../auth.js'
import { BadRequestError } from '../lib/errors.js'
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function requireUserId(c: Context) {
  const session = await requireSession(c.req.raw.headers)

  return session.user.id
}

async function parseJsonBody<T extends Record<string, unknown>>(c: Context) {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    throw new BadRequestError('Request body must be valid JSON.')
  }

  if (!isRecord(body)) {
    throw new BadRequestError('Request body must be a JSON object.')
  }

  return body as T
}

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
