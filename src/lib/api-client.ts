export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  signal?: AbortSignal
}

type ApiErrorPayload = {
  error?: string
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body
      ? {
          'Content-Type': 'application/json',
        }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const payload = (await response.json().catch(() => null)) as T | ApiErrorPayload | null

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed with ${response.status}.`

    throw new Error(message)
  }

  return payload as T
}
