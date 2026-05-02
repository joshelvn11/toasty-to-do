import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthPageShell } from '../components/auth-page-shell.tsx'
import { authClient } from '../lib/auth-client.ts'

export function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords must match before you create an account.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Unable to create your account.')
        return
      }

      navigate('/app', { replace: true })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create your account.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell
      alternateCta="Sign in"
      alternateHref="/sign-in"
      alternateLabel="Already have an account?"
      description="Sign-up stays intentionally simple: one account, one protected workspace, and a direct path into your private backlog."
      eyebrow="Create account"
      title="Set up a personal workspace."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="sign-up-name">Name</Label>
          <Input
            id="sign-up-name"
            autoComplete="name"
            disabled={isSubmitting}
            name="name"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-email">Email</Label>
          <Input
            id="sign-up-email"
            autoComplete="email"
            disabled={isSubmitting}
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <Input
            id="sign-up-password"
            autoComplete="new-password"
            disabled={isSubmitting}
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-confirm-password">Confirm password</Label>
          <Input
            id="sign-up-confirm-password"
            autoComplete="new-password"
            disabled={isSubmitting}
            minLength={8}
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not create account</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthPageShell>
  )
}
