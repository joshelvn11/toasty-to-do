import fs from 'node:fs/promises'
import path from 'node:path'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { auth } from './auth.js'
import { focusSessionRoutes } from './focus-sessions/focus-session-routes.js'
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from './lib/errors.js'
import {
  getStaticContentType,
  hasClientBuild,
  resolveStaticAssetPath,
} from './lib/static-app.js'
import { taskListRoutes } from './task-lists/task-list-routes.js'
import { taskRoutes } from './tasks/task-routes.js'

export const app = new Hono()
const indexHtmlPath = path.resolve(process.cwd(), 'dist/client/index.html')

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  if (error instanceof UnauthorizedError) {
    return c.json({ error: error.message }, 401)
  }

  if (error instanceof BadRequestError) {
    return c.json({ error: error.message }, 400)
  }

  if (error instanceof ConflictError) {
    return c.json({ error: error.message }, 409)
  }

  if (error instanceof NotFoundError) {
    return c.json({ error: error.message }, 404)
  }

  console.error(error)

  return c.json({ error: 'Internal Server Error' }, 500)
})

app.get('/api/health', (c) => {
  return c.json({
    service: 'toasty-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

app.on(['GET', 'POST'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api/tasks', taskRoutes)
app.route('/api/lists', taskListRoutes)
app.route('/api/focus-sessions', focusSessionRoutes)

app.get('*', async (c) => {
  if (c.req.path.startsWith('/api')) {
    return c.notFound()
  }

  if (!hasClientBuild()) {
    return c.notFound()
  }

  const filePath = resolveStaticAssetPath(c.req.path) ?? indexHtmlPath
  const body = await fs.readFile(filePath)
  const contentType = getStaticContentType(filePath)

  if (contentType) {
    c.header('Content-Type', contentType)
  }

  if (c.req.method === 'HEAD') {
    return c.body(null)
  }

  return c.body(body)
})

export type AppType = typeof app
