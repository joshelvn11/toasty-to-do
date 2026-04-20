import { Hono } from 'hono'
import { auth } from './auth.js'

export const app = new Hono()

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

export type AppType = typeof app
