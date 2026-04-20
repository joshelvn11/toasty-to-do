import { Hono } from 'hono'
import { parseJsonBody, requireUserId } from '../lib/route-utils.js'
import {
  addTaskToFocusSession,
  completeFocusSessionTask,
  createFocusSession,
  endFocusSession,
  getCurrentFocusSession,
  removeTaskFromFocusSession,
  type AddTaskToFocusSessionInput,
  type CreateFocusSessionInput,
} from './focus-session-service.js'

export const focusSessionRoutes = new Hono()

focusSessionRoutes.get('/current', async (c) => {
  const userId = await requireUserId(c)
  const session = getCurrentFocusSession(userId)

  return c.json({
    session,
  })
})

focusSessionRoutes.post('/', async (c) => {
  const userId = await requireUserId(c)
  const body = await parseJsonBody<CreateFocusSessionInput>(c)
  const session = createFocusSession(userId, body)

  return c.json(
    {
      session,
    },
    201,
  )
})

focusSessionRoutes.post('/:sessionId/end', async (c) => {
  const userId = await requireUserId(c)
  const session = endFocusSession(userId, c.req.param('sessionId'))

  return c.json({
    session,
  })
})

focusSessionRoutes.post('/:sessionId/tasks', async (c) => {
  const userId = await requireUserId(c)
  const body = await parseJsonBody<AddTaskToFocusSessionInput>(c)
  const session = addTaskToFocusSession(userId, c.req.param('sessionId'), body)

  return c.json({
    session,
  })
})

focusSessionRoutes.delete('/:sessionId/tasks/:taskId', async (c) => {
  const userId = await requireUserId(c)
  const session = removeTaskFromFocusSession(
    userId,
    c.req.param('sessionId'),
    c.req.param('taskId'),
  )

  return c.json({
    session,
  })
})

focusSessionRoutes.post('/:sessionId/tasks/:taskId/complete', async (c) => {
  const userId = await requireUserId(c)
  const session = completeFocusSessionTask(
    userId,
    c.req.param('sessionId'),
    c.req.param('taskId'),
  )

  return c.json({
    session,
  })
})
