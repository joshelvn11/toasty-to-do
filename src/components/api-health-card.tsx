import { useApiHealth } from '../hooks/use-api-health.ts'

export function ApiHealthCard() {
  const health = useApiHealth()

  return (
    <section className="status-card" aria-live="polite">
      <header>
        <div>
          <div className="eyebrow">Server link</div>
          <h3>API status</h3>
        </div>
        <HealthStatus state={health.kind} />
      </header>

      {health.kind === 'ready' ? (
        <>
          <p>
            The Hono API is responding through the Vite proxy, which means the
            frontend, auth routes, and server boundary are all connected
            cleanly.
          </p>
          <span className="code-chip">
            {health.data.service} · {health.data.status} · {health.data.timestamp}
          </span>
        </>
      ) : null}

      {health.kind === 'loading' ? (
        <p>Checking the local API at <code>/api/health</code>.</p>
      ) : null}

      {health.kind === 'error' ? (
        <>
          <p>
            The client rendered, but the API is not responding yet. This usually
            means the Node server is not running or the proxy target is wrong.
          </p>
          <span className="code-chip">{health.message}</span>
        </>
      ) : null}
    </section>
  )
}

function HealthStatus({ state }: { state: 'loading' | 'ready' | 'error' }) {
  const label =
    state === 'ready' ? 'Connected' : state === 'error' ? 'Unavailable' : 'Checking'

  return <span className={`status-pill ${state}`}>{label}</span>
}
