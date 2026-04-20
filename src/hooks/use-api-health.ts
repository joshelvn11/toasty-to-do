import { useEffect, useState } from 'react'

export type ApiHealthResponse = {
  service: string
  status: 'ok'
  timestamp: string
}

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: ApiHealthResponse }
  | { kind: 'error'; message: string }

export function useApiHealth() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    async function loadHealth() {
      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`)
        }

        const data = (await response.json()) as ApiHealthResponse
        setState({ kind: 'ready', data })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setState({
          kind: 'error',
          message:
            error instanceof Error ? error.message : 'Unknown health check error',
        })
      }
    }

    void loadHealth()

    return () => {
      controller.abort()
    }
  }, [])

  return state
}
