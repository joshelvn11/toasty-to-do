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
              resolves the current user cleanly, and the server now has the
              Phase 3 task domain in place for the backlog interface that comes
              next.
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
              The structural distinction is still in place, and Phase 3 now
              backs it with real task and focus-session tables plus authenticated
              task APIs. The interface work is still ahead, but the data
              foundation is no longer a placeholder.
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
                  state will be wired into the new authenticated task API here
                  in the next phase.
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
                  <div className="eyebrow">Server foundation</div>
                  <h3>Phase 3 status</h3>
                </div>
                <span className="status-pill ready">Ready</span>
              </header>

              <ul className="status-list">
                <li>Protected routes resolve the active Better Auth session</li>
                <li>The Better Auth <code>user</code> table is the canonical app user record</li>
                <li>Authenticated <code>/api/tasks</code> routes now enforce user-scoped task access</li>
                <li>Phase 4 can build the backlog UI on top of the new task write path</li>
              </ul>

              <p className="meta-copy">
                This page is now the hand-off point between backend domain work
                and the backlog and focus-session interfaces that follow.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}
