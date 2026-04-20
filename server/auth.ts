import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { db } from './db/client.js'
import { authSchema } from './db/schema/index.js'
import { env } from './config/env.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: authSchema,
  }),
  baseURL: env.authUrl,
  secret: env.authSecret,
  trustedOrigins: [env.appUrl],
  emailAndPassword: {
    enabled: true,
  },
})

export type AuthSession = Exclude<
  Awaited<ReturnType<typeof auth.api.getSession>>,
  null
>

export async function getSessionFromHeaders(headers: Headers) {
  return auth.api.getSession({
    headers,
  })
}

export async function requireSession(headers: Headers): Promise<AuthSession> {
  const session = await getSessionFromHeaders(headers)

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}
