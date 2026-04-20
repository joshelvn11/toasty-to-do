import path from 'node:path'
import process from 'node:process'

function resolveDatabasePath(rawPath: string) {
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath)
}

function parsePort(rawPort: string | undefined) {
  const parsed = Number(rawPort)
  return Number.isFinite(parsed) ? parsed : 8787
}

export const env = {
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  authUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:8787',
  authSecret:
    process.env.BETTER_AUTH_SECRET ??
    'development-secret-change-me-development-secret',
  databasePath: resolveDatabasePath(
    process.env.DATABASE_PATH ?? './data/toasty-to-do.sqlite',
  ),
  port: parsePort(process.env.PORT),
}
