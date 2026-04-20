import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      description="Phase 2 keeps sign-up intentionally simple: one account, one protected workspace, and a direct path into the app shell."
      eyebrow="Create account"
      title="Set up a personal workspace."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            autoComplete="name"
            className="field-input"
            disabled={isSubmitting}
            name="name"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </label>

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
            autoComplete="new-password"
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

        <label className="field">
          <span>Confirm password</span>
          <input
            autoComplete="new-password"
            className="field-input"
            disabled={isSubmitting}
            minLength={8}
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        {error ? <p className="form-message error">{error}</p> : null}

        <button
          className="button-link auth-submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthPageShell>
  )
}
