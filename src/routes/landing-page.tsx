import { Link } from 'react-router-dom'
import { ApiHealthCard } from '../components/api-health-card.tsx'

export function LandingPage() {
  return (
    <main className="app-shell">
      <div className="site-frame">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark">Phase 2 authentication</div>
            <h1 className="brand-title">Toasty To Do</h1>
            <p className="brand-copy">
              A minimalist backlog and focus-session app with real account
              access, protected routes, and a calm path into the app.
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
            <h2>Account access first, task features next.</h2>
            <p className="hero-copy">
              The app now separates public entry from authenticated space. You
              can create an account, sign in, and land in a protected app shell
              that is ready for backlog and focus-session work in the next
              phases.
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
            <h3>What Phase 2 includes</h3>
            <p>
              Account creation, sign-in, protected app routing, Better Auth
              schema ownership, and a shared current-user state for the client.
            </p>
            <ul className="bullet-list">
              <li>Dedicated <code>/sign-in</code> and <code>/sign-up</code> routes</li>
              <li>Public-only and protected route guards</li>
              <li>Better Auth tables defined in Drizzle</li>
              <li>Authenticated handoff into <code>/app</code></li>
            </ul>
          </article>

          <article className="detail-card">
            <h3>What comes next</h3>
            <p>
              With user ownership established, the next phases can add
              user-bound task storage, backlog management, and focus sessions on
              top of the same auth foundation.
            </p>
            <ul className="bullet-list">
              <li>Task schema and ownership rules</li>
              <li>Backlog capture and priority management</li>
              <li>Focus-session workflow</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}
