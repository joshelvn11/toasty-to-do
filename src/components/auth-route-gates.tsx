import { type ReactNode, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthState } from '../hooks/use-auth-state.ts'
import { Card, CardContent } from '@/components/ui/card'
import { UNAUTHORIZED_EVENT } from '@/lib/api-client'

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const auth = useAuthState()

  if (auth.status === 'loading') {
    return <AuthGateFallback message="Checking your session." />
  }

  if (auth.status === 'authenticated') {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuthState()
  const navigate = useNavigate()

  useEffect(() => {
    function handleUnauthorized() {
      navigate('/sign-in', { replace: true })
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [navigate])

  if (auth.status === 'loading') {
    return <AuthGateFallback message="Loading your workspace." />
  }

  if (auth.status === 'anonymous') {
    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
}

function AuthGateFallback({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-border/70 shadow-sm" aria-live="polite">
        <CardContent className="space-y-3 pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Session
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Toasty To Do</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </main>
  )
}
