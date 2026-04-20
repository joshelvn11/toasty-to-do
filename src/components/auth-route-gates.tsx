import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthState } from '../hooks/use-auth-state.ts'

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
    <main className="app-shell auth-shell">
      <div className="site-frame auth-frame">
        <section className="auth-loading-card" aria-live="polite">
          <div className="eyebrow">Session</div>
          <h1 className="brand-title">Toasty To Do</h1>
          <p className="brand-copy">{message}</p>
        </section>
      </div>
    </main>
  )
}
