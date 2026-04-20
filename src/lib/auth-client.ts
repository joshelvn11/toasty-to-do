import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

type SessionHookData = ReturnType<typeof authClient.useSession>['data']
type AuthenticatedData = Exclude<SessionHookData, null | undefined>

export type CurrentUser = AuthenticatedData['user']
export type CurrentSession = AuthenticatedData['session']
