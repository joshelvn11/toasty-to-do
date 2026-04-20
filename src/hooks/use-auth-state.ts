import {
  authClient,
  type CurrentSession,
  type CurrentUser,
} from '../lib/auth-client.ts'

export type AuthState =
  | { status: 'loading'; error: string | null }
  | { status: 'anonymous'; error: string | null }
  | {
      status: 'authenticated'
      error: string | null
      user: CurrentUser
      session: CurrentSession
    }

export function useAuthState(): AuthState {
  const session = authClient.useSession()

  if (session.isPending) {
    return {
      status: 'loading',
      error: null,
    }
  }

  if (!session.data) {
    return {
      status: 'anonymous',
      error: session.error?.message ?? null,
    }
  }

  return {
    status: 'authenticated',
    error: session.error?.message ?? null,
    user: session.data.user,
    session: session.data.session,
  }
}
