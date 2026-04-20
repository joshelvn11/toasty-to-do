import type { Context } from 'hono'
import { requireSession } from '../auth.js'
import { BadRequestError } from './errors.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function requireUserId(c: Context) {
  const session = await requireSession(c.req.raw.headers)

  return session.user.id
}

export async function parseJsonBody<T extends Record<string, unknown>>(c: Context) {
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
