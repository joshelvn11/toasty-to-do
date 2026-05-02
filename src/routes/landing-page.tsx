import { Link } from 'react-router-dom'
import { ApiHealthCard } from '@/components/api-health-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Badge variant="outline">MVP workflow</Badge>
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight">Toasty To Do</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              A minimalist backlog and focus-session app that keeps the full list
              available while making the current working set unmistakably small.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/sign-up">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="http://localhost:8787/api/health" rel="noreferrer" target="_blank">
              View health endpoint
            </a>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.8fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="space-y-2">
            <Badge className="w-fit" variant="secondary">
              Current shape
            </Badge>
            <CardTitle>The backlog and focus flow are live.</CardTitle>
            <CardDescription>
              Signed-in users can capture tasks, prioritize them, start a session,
              pull work into focus, complete it, or return it to the backlog.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/sign-up">Create your account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/70 shadow-none">
                <CardHeader className="space-y-1">
                  <CardTitle>What the app includes now</CardTitle>
                  <CardDescription>
                    The MVP stays intentionally narrow and centered on the
                    backlog-to-focus workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Account creation, sign-in, and protected routing</li>
                    <li>Backlog creation, editing, completion, and filtering</li>
                    <li>One active focus session with optional duration</li>
                    <li>Task pull-in, completion, and return-to-backlog actions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-none">
                <CardHeader className="space-y-1">
                  <CardTitle>What stays out of scope</CardTitle>
                  <CardDescription>
                    The MVP avoids turning into a general-purpose productivity suite.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>No projects, tags, or due dates</li>
                    <li>No recurring tasks or reminders</li>
                    <li>No collaboration or shared lists</li>
                    <li>No analytics-heavy dashboards</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <ApiHealthCard />
      </section>
    </main>
  )
}
