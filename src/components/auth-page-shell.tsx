import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApiHealthCard } from '@/components/api-health-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Badge variant="outline">{eyebrow}</Badge>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Toasty To Do</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              A calm backlog and focus-session app for one person at a time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild>
            <Link to={alternateHref}>{alternateCta}</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.8fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <Badge className="w-fit" variant="secondary">
              {eyebrow}
            </Badge>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            <p className="text-sm text-muted-foreground">
              {alternateLabel}{' '}
              <Link className="font-medium text-foreground underline underline-offset-4" to={alternateHref}>
                {alternateCta}
              </Link>
            </p>
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <ApiHealthCard />

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="space-y-1">
              <Badge className="w-fit" variant="outline">
                Why this split
              </Badge>
              <CardTitle>Public first, backlog second</CardTitle>
              <CardDescription>
                Public routes stay lightweight, while authenticated routes keep the
                current user and backlog state behind session checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Email and password only for the MVP</li>
                <li>Backlog management lives at the protected <code>/app</code> route</li>
                <li>Focus sessions narrow attention without creating duplicate tasks</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}
