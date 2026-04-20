import { Link } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'

export function AppShellPage() {
  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="app-topbar">
          <div className="brand-block">
            <div className="brand-mark">Authenticated route placeholder</div>
            <h1 className="brand-title">App shell</h1>
            <p className="brand-copy">
              This route is intentionally ready for protected app flow, but it
              stops short of implementing authentication behavior in Phase 1.
            </p>
          </div>

          <nav className="nav-links" aria-label="App links">
            <Link className="link-pill" to="/">
              Back to landing
            </Link>
          </nav>
        </header>

        <section className="app-grid">
          <section className="workspace-card">
            <header>
              <div>
                <div className="eyebrow">Workspace split</div>
                <h3 className="brand-title">Backlog and focus placeholders</h3>
              </div>
              <span className="status-badge">Phase 1 only</span>
            </header>

            <p className="workspace-copy">
              The structural distinction is in place now so future phases can add
              real data and actions without rethinking the layout.
            </p>

            <div className="workspace-columns">
              <article className="placeholder-card">
                <div className="section-tag">Backlog</div>
                <h3>All tasks live here</h3>
                <p>
                  This column will become the ranked backlog where the user
                  captures and reviews their full list of work.
                </p>
                <div className="placeholder-note">
                  <strong>Next phase target</strong>
                  Task capture, priority levels, edit actions, and completion
                  state will be introduced here.
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
                  <strong>Next phase target</strong>
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
                  <div className="eyebrow">Server boundaries</div>
                  <h3>Scaffold status</h3>
                </div>
                <span className="status-pill ready">Ready</span>
              </header>

              <ul className="status-list">
                <li>Node-only code lives under <code>server/</code></li>
                <li>Drizzle bootstrap is ready for schema work</li>
                <li>Better Auth is mounted for Phase 2</li>
                <li>Client routes remain browser-safe under <code>src/</code></li>
              </ul>

              <p className="meta-copy">
                This page is the hand-off point between infrastructure work and
                actual product behavior.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}
