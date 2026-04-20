import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApiHealthCard } from './api-health-card.tsx'

type AuthPageShellProps = {
  eyebrow: string
  title: string
  description: string
  alternateLabel: string
  alternateHref: string
  alternateCta: string
  children: ReactNode
}

export function AuthPageShell({
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateHref,
  alternateCta,
  children,
}: AuthPageShellProps) {
  return (
    <main className="app-shell auth-shell">
      <div className="site-frame">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark">{eyebrow}</div>
            <h1 className="brand-title">Toasty To Do</h1>
            <p className="brand-copy">
              A calm backlog and focus-session app for one person at a time.
            </p>
          </div>

          <nav className="nav-links" aria-label="Authentication links">
            <Link className="link-pill" to="/">
              Back to home
            </Link>
            <Link className="button-link" to={alternateHref}>
              {alternateCta}
            </Link>
          </nav>
        </header>

        <section className="page-grid auth-grid">
          <article className="auth-card">
            <div className="eyebrow">{eyebrow}</div>
            <h2 className="auth-title">{title}</h2>
            <p className="hero-copy">{description}</p>
            {children}

            <p className="auth-alternate">
              {alternateLabel} <Link to={alternateHref}>{alternateCta}</Link>
            </p>
          </article>

          <aside className="stack-list">
            <ApiHealthCard />

            <section className="status-card">
              <header>
                <div>
                  <div className="eyebrow">Why this split</div>
                  <h3>Public first, backlog second</h3>
                </div>
                <span className="status-pill ready">Phase 4</span>
              </header>

              <p>
                Public routes stay lightweight, while authenticated routes keep
                the current user and backlog state behind session checks.
              </p>

              <ul className="status-list">
                <li>Email and password only for the MVP</li>
                <li>Backlog management lives at the protected <code>/app</code> route</li>
                <li>Focus-session workflow is still reserved for a later phase</li>
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}
