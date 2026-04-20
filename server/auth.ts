import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { db } from './db/client.js'
import { env } from './config/env.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  baseURL: env.authUrl,
  secret: env.authSecret,
  trustedOrigins: [env.appUrl],
  emailAndPassword: {
    enabled: true,
  },
})
