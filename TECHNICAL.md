# Technical Notes

## Authentication

- Better Auth is mounted at `/api/auth/*` from the Hono server in [`server/app.ts`](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/app.ts:1).
- Email/password auth is the only enabled sign-in method in the MVP.
- The client uses `better-auth/react` for session state and auth actions. No custom `/api/me` endpoint is introduced in phase 2.

## Schema Ownership

- Better Auth tables are defined in Drizzle under [`server/db/schema/index.ts`](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/db/schema/index.ts:1).
- The `user` table owned by Better Auth is the canonical application user record for later phases.
- Phase 3 and beyond should reference that `user` table rather than creating a duplicate app-specific users table.

## Current User Resolution

- Server code resolves the current session with `auth.api.getSession({ headers })`, wrapped by helpers in [`server/auth.ts`](/Users/joshbeaver/Documents/Projects/toasty-to-do/server/auth.ts:1).
- Client code derives normalized auth state from `authClient.useSession()` via [`src/hooks/use-auth-state.ts`](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/hooks/use-auth-state.ts:1).
- Route protection is handled client-side with public-only and protected wrappers in [`src/components/auth-route-gates.tsx`](/Users/joshbeaver/Documents/Projects/toasty-to-do/src/components/auth-route-gates.tsx:1).

## Route Boundaries

- `/`, `/sign-in`, and `/sign-up` are public-only routes.
- `/app` is the protected authenticated shell.
- Unknown routes redirect to `/`, which then redirects authenticated users into `/app`.
