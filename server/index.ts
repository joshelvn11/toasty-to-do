import { serve } from '@hono/node-server'
import { app } from './app.js'
import { env } from './config/env.js'
import { applyPendingMigrations } from './db/migrate.js'

applyPendingMigrations()

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`Toasty API listening on http://localhost:${info.port}`)
  },
)
