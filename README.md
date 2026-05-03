# Toasty To Do

Toasty To Do is a minimalist personal task app built around two concepts:

- A backlog that holds everything you need to do
- A focus session that narrows attention to what matters right now

The backlog now supports lightweight user-defined lists so related tasks can be grouped without turning the app into a full project-management tool.

The protected `/app` route now supports the full backlog-to-focus workflow. Signed-in users can manage backlog tasks through `/api/tasks`, organize them into personal lists through `/api/lists`, start a single active focus session, pull tasks into it, remove them, end the session, and complete session tasks through `/api/focus-sessions` without duplicating task records.

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

The dev API also applies any pending Drizzle migrations automatically on startup, so existing local databases stay in sync as the schema evolves.

The default local endpoints are:

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:8787/api/health`
- Better Auth base route: `http://localhost:8787/api/auth/*`
- Task API base route: `http://localhost:8787/api/tasks`
- Task-list API base route: `http://localhost:8787/api/lists`
- Focus-session API base route: `http://localhost:8787/api/focus-sessions`
- Public auth routes: `http://localhost:5173/sign-in` and `http://localhost:5173/sign-up`
- Protected app route: `http://localhost:5173/app`

The Vite client proxies `/api/*` requests to the Hono server during development.

## Docker Deployment

The repository now ships with a production `Dockerfile` and a `docker-compose.yml` that run the app as a single container:

- the Vite frontend is built into static assets
- the Hono server serves both `/api/*` and the built frontend
- Drizzle migrations still run automatically on container startup
- SQLite data is persisted in a mounted `/app/data` volume

Build and run with Docker Compose:

```bash
docker compose up --build
```

The container listens on port `3000` by default in Docker, so the app is available at `http://localhost:3000`.

Important production notes:

- Set `APP_URL` and `BETTER_AUTH_URL` to the same public HTTPS origin in production, for example `https://toasty.example.com`
- Set a strong `BETTER_AUTH_SECRET`
- Keep `DATABASE_PATH` pointed at a persistent volume path such as `/app/data/toasty-to-do.sqlite`

This single-container shape is intended to work cleanly on platforms like Coolify, where you can deploy from either the `Dockerfile` or the included Compose file.

## Scripts

- `npm run dev` starts the client and server together
- `npm run dev:client` starts only the Vite frontend
- `npm run dev:server` starts only the Hono server in watch mode
- `npm run db:migrate` applies Drizzle migrations to the configured SQLite database
- `npm run test` runs the Vitest suite for client UI flows and server services
- `npm run typecheck` checks client, config, and server TypeScript
- `npm run build` applies migrations, runs type checks, and builds the frontend bundle
- `npm run build:client` builds the Vite frontend bundle into `dist/client`
- `npm run build:server` compiles the Hono server into `dist/server`
- `npm run build` runs type checks and produces the full production build
- `npm run lint` runs ESLint
- `npm run preview` previews the Vite frontend build
- `npm run start` starts the compiled production server

## Current Status

The app now supports the full MVP workflow in one authenticated screen with a shared `shadcn/ui` component baseline. Users can authenticate, land in `/app`, create and prioritize backlog tasks, organize them into personal lists, start or end a focus session with an optional duration, pull tasks into the current focus set, complete focus work, or return tasks to the backlog. The backlog remains the full source list while the focus panel highlights the smaller working set for the active session, and the highest-value client/server flows now have automated coverage through Vitest.
