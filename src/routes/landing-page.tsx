import { Link } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'

export function LandingPage() {
  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark">Phase 4 backlog</div>
            <h1 className="brand-title">Toasty To Do</h1>
            <p className="brand-copy">
              A minimalist backlog and focus-session app with real account
              access, a working backlog, and a calm path into the app.
            </p>
          </div>

          <nav className="nav-links" aria-label="Primary">
            <Link className="button-link" to="/sign-in">
              Sign in
            </Link>
            <Link className="link-pill" to="/sign-up">
              Create account
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
            <h2>The backlog is live. Focus comes next.</h2>
            <p className="hero-copy">
              The app now separates public entry from authenticated space and
              gives each signed-in user a private backlog for capture,
              prioritization, editing, and completion.
            </p>

            <div className="hero-actions">
              <Link className="button-link" to="/sign-up">
                Create your account
              </Link>
              <Link className="link-pill" to="/sign-in">
                Sign in
              </Link>
            </div>
          </article>

          <ApiHealthCard />
        </section>

        <section className="stack-list two-up">
          <article className="detail-card">
            <h3>What the app includes now</h3>
            <p>
              Account creation, sign-in, protected app routing, Better Auth
              schema ownership, and a user-owned backlog interface backed by the
              authenticated task API.
            </p>
            <ul className="bullet-list">
              <li>Dedicated <code>/sign-in</code> and <code>/sign-up</code> routes</li>
              <li>Public-only and protected route guards</li>
              <li>Better Auth tables defined in Drizzle</li>
              <li>Authenticated handoff into a working <code>/app</code> backlog</li>
            </ul>
          </article>

          <article className="detail-card">
            <h3>What comes next</h3>
            <p>
              With the backlog experience in place, the next phase can introduce
              focus sessions without changing the core task ownership model.
            </p>
            <ul className="bullet-list">
              <li>Focus-session creation with optional duration</li>
              <li>Moving tasks into and out of the current session</li>
              <li>A clearer separation between backlog and active focus</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}
