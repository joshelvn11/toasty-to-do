import { AlertCircleIcon, CheckCircle2Icon, LoaderCircleIcon } from 'lucide-react'
import { useApiHealth } from '@/hooks/use-api-health'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ApiHealthCard() {
  const health = useApiHealth()

  return (
    <Card className="border-border/70 shadow-sm" aria-live="polite">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Server link
            </p>
            <CardTitle>API status</CardTitle>
          </div>
          <HealthStatus state={health.kind} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {health.kind === 'ready' ? (
          <>
            <p>
              The Hono API is responding through the Vite proxy, so the frontend,
              auth routes, and server boundary are all connected cleanly.
            </p>
            <code className="block rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground">
              {health.data.service} · {health.data.status} · {health.data.timestamp}
            </code>
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
            <code className="block rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground">
              {health.message}
            </code>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function HealthStatus({ state }: { state: 'loading' | 'ready' | 'error' }) {
  if (state === 'ready') {
    return (
      <Badge className="gap-1" variant="default">
        <CheckCircle2Icon className="size-3.5" />
        Connected
      </Badge>
    )
  }

  if (state === 'error') {
    return (
      <Badge className="gap-1" variant="destructive">
        <AlertCircleIcon className="size-3.5" />
        Unavailable
      </Badge>
    )
  }

  return (
    <Badge className="gap-1" variant="secondary">
      <LoaderCircleIcon className="size-3.5 animate-spin" />
      Checking
    </Badge>
  )
}
