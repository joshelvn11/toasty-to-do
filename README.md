# Toasty To Do

Toasty To Do is a minimalist personal task app built around two concepts:

- A backlog that holds everything you need to do
- A focus session that narrows attention to what matters right now

Phase 6 turns the protected `/app` route into the full backlog-to-focus workflow. Signed-in users can manage backlog tasks through `/api/tasks`, start a single active focus session, pull tasks into it, remove them, end the session, and complete session tasks through `/api/focus-sessions` without duplicating task records.

## Stack

- React 19 + TypeScript
- Vite for the frontend
- Tailwind CSS v4 + `shadcn/ui` for the default component system
- Hono on Node.js for the API
- SQLite via `better-sqlite3`
- Drizzle ORM and Drizzle Kit
- Better Auth

## Project Structure

- `src/` contains the client app, routes, hooks, and presentation code
- `server/` contains the Hono server, auth bootstrap, database bootstrap, and server-only utilities
- `drizzle/` is reserved for migrations and schema artifacts

## Environment

Copy `.env.example` to `.env.local` before running the app locally.

```bash
cp .env.example .env.local
```

Current environment variables:

- `APP_URL` for the Vite frontend origin
- `BETTER_AUTH_URL` for the Hono server origin
- `BETTER_AUTH_SECRET` for Better Auth
- `DATABASE_PATH` for the SQLite database file
- `PORT` for the API server

## Development

Install dependencies:

```bash
npm install
```

Start the frontend and API server together:

```bash
npm run dev
```

Apply database migrations before using authentication or task APIs on a fresh database:

```bash
npm run db:migrate
```

The default local endpoints are:

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:8787/api/health`
- Better Auth base route: `http://localhost:8787/api/auth/*`
- Task API base route: `http://localhost:8787/api/tasks`
- Focus-session API base route: `http://localhost:8787/api/focus-sessions`
- Public auth routes: `http://localhost:5173/sign-in` and `http://localhost:5173/sign-up`
- Protected app route: `http://localhost:5173/app`

The Vite client proxies `/api/*` requests to the Hono server during development.

## Scripts

- `npm run dev` starts the client and server together
- `npm run dev:client` starts only the Vite frontend
- `npm run dev:server` starts only the Hono server in watch mode
- `npm run db:migrate` applies Drizzle migrations to the configured SQLite database
- `npm run test` runs the Vitest suite for client UI flows and server services
- `npm run typecheck` checks client, config, and server TypeScript
- `npm run build` applies migrations, runs type checks, and builds the frontend bundle
- `npm run lint` runs ESLint
- `npm run preview` previews the Vite frontend build

## Current Status

The app now supports the full MVP workflow in one authenticated screen with a shared `shadcn/ui` component baseline. Users can authenticate, land in `/app`, create and prioritize backlog tasks, start or end a focus session with an optional duration, pull tasks into the current focus set, complete focus work, or return tasks to the backlog. The backlog remains the full source list while the focus panel highlights the smaller working set for the active session, and the highest-value client/server flows now have automated coverage through Vitest.
