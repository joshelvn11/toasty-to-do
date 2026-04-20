import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthPageShell } from '../components/auth-page-shell.tsx'
import { authClient } from '../lib/auth-client.ts'

export function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Unable to sign in right now.')
        return
      }

      navigate('/app', { replace: true })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to sign in right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell
      alternateCta="Create account"
      alternateHref="/sign-up"
      alternateLabel="Need an account?"
      description="Use your email and password to reach the protected app shell. Backlog and focus-session features arrive in the next phases."
      eyebrow="Welcome back"
      title="Sign in and get back to the list."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            className="field-input"
            disabled={isSubmitting}
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            className="field-input"
            disabled={isSubmitting}
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error ? <p className="form-message error">{error}</p> : null}

        <button
          className="button-link auth-submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthPageShell>
  )
}
