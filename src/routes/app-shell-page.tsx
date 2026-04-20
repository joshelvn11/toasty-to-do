import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'
import { useAuthState } from '../hooks/use-auth-state.ts'
import { authClient } from '../lib/auth-client.ts'

export function AppShellPage() {
  const auth = useAuthState()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (auth.status !== 'authenticated') {
    return null
  }

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await authClient.signOut()
      navigate('/sign-in', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="app-topbar">
          <div className="brand-block">
            <div className="brand-mark">Authenticated workspace</div>
            <h1 className="brand-title">Welcome, {auth.user.name}</h1>
            <p className="brand-copy">
              You are signed in as {auth.user.email}. This protected shell now
              resolves the current user cleanly and is ready for task features
              in later phases.
            </p>
          </div>

          <nav className="nav-links" aria-label="App links">
            <Link className="link-pill" to="/">
              Public home
            </Link>
            <button
              className="button-link button-reset"
              disabled={isSigningOut}
              onClick={handleSignOut}
              type="button"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </nav>
        </header>

        <section className="app-grid">
          <section className="workspace-card">
            <header>
              <div>
                <div className="eyebrow">Signed-in state</div>
                <h3 className="brand-title">Backlog and focus placeholders</h3>
              </div>
              <span className="status-badge">Authenticated</span>
            </header>

            <p className="workspace-copy">
              The structural distinction is still in place, but now it sits
              behind real authentication so future phases can bind data and
              actions to the current user without changing the app shell shape.
            </p>

            <section className="session-summary" aria-label="Current session">
              <div className="session-card">
                <div className="section-tag">Current user</div>
                <h3>{auth.user.name}</h3>
                <p>{auth.user.email}</p>
              </div>

              <div className="session-card">
                <div className="section-tag">Session expires</div>
                <h3>{new Date(auth.session.expiresAt).toLocaleString()}</h3>
                <p>
                  Session data is sourced from Better Auth and shared across
                  protected routes.
                </p>
              </div>
            </section>

            <div className="workspace-columns">
              <article className="placeholder-card">
                <div className="section-tag">Backlog</div>
                <h3>All tasks live here</h3>
                <p>
                  This column will become the ranked backlog where the user
                  captures and reviews their full list of work.
                </p>
                <div className="placeholder-note">
                  <strong>Later phase target</strong>
                  Task capture, priority levels, edit actions, and completion
                  state will be introduced here on top of the authenticated user
                  record.
                </div>
              </article>

              <article className="placeholder-card">
                <div className="section-tag">Focus session</div>
                <h3>Current work gets narrowed here</h3>
                <p>
                  This column will become the active session view, where a small
                  set of backlog items is pulled into a focused work block.
                </p>
                <div className="placeholder-note">
                  <strong>Later phase target</strong>
                  Session creation, task membership, and end-session flow will
                  live in this area.
                </div>
              </article>
            </div>
          </section>

          <aside className="stack-list">
            <ApiHealthCard />

            <section className="status-card">
              <header>
                <div>
                  <div className="eyebrow">Auth boundaries</div>
                  <h3>Phase 2 status</h3>
                </div>
                <span className="status-pill ready">Ready</span>
              </header>

              <ul className="status-list">
                <li>Protected routes resolve the active Better Auth session</li>
                <li>The Better Auth <code>user</code> table is the canonical app user record</li>
                <li>Unauthenticated users are redirected away from <code>/app</code></li>
                <li>Sign-out returns the user to the public auth flow</li>
              </ul>

              <p className="meta-copy">
                This page is the hand-off point between authentication work and
                the task and focus-session features that follow.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}
