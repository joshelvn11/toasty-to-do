import { Link } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'

export function LandingPage() {
  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark">Phase 1 foundation</div>
            <h1 className="brand-title">Toasty To Do</h1>
            <p className="brand-copy">
              A minimalist backlog and focus-session app, now wired as a Vite
              client with a small Node API behind it.
            </p>
          </div>

          <nav className="nav-links" aria-label="Primary">
            <Link className="button-link" to="/app">
              Open app shell
            </Link>
            <a
              className="link-pill"
              href="http://localhost:8787/api/health"
              target="_blank"
              rel="noreferrer"
            >
              View health endpoint
            </a>
          </nav>
        </header>

        <section className="page-grid">
          <article className="hero-card">
            <div className="eyebrow">Current shape</div>
            <h2>Full-stack skeleton, no feature noise.</h2>
            <p className="hero-copy">
              The starter demo is gone. In its place is a clean shell for the
              public entry route, the authenticated app route, the server mount
              points for Better Auth, and the SQLite and Drizzle foundations the
              next phases will build on.
            </p>

            <div className="hero-actions">
              <Link className="button-link" to="/app">
                Enter /app
              </Link>
              <a className="link-pill" href="/api/health">
                Test proxied /api
              </a>
            </div>
          </article>

          <ApiHealthCard />
        </section>

        <section className="stack-list two-up">
          <article className="detail-card">
            <h3>What Phase 1 includes</h3>
            <p>
              Routing, server bootstrap, auth mount, database bootstrap, shared
              development scripts, and a restrained visual system.
            </p>
            <ul className="bullet-list">
              <li>React Router routes for <code>/</code> and <code>/app</code></li>
              <li>Hono server mounted at <code>/api</code></li>
              <li>Better Auth reserved at <code>/api/auth/*</code></li>
              <li>SQLite file bootstrap with Drizzle wiring</li>
            </ul>
          </article>

          <article className="detail-card">
            <h3>What comes next</h3>
            <p>
              Future phases will add real authentication screens, user-bound
              task storage, backlog management, and focus sessions.
            </p>
            <ul className="bullet-list">
              <li>Authentication and protected app state</li>
              <li>Task schema and domain rules</li>
              <li>Backlog capture and priority management</li>
              <li>Focus-session workflow</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}
