**deimudda — Friendly Setup Guide**

This guide gets you from zero to running in one command, then explains what’s inside so you feel confident.

**Quick Start (one command)**
- Install Docker Desktop (or Docker Engine) and keep it running.
- In this folder, run:
  - `docker compose up --build`
- Wait until you see: `Server running on http://localhost:3000/` (or the PORT you chose)
- Open this once to “log in” locally (no real OAuth needed):
  - `http://localhost:${PORT:-3000}/api/dev-login?openId=admin-local&name=Admin`
- Now open the app:
  - `http://localhost:${PORT:-3000}`
  - Health check: `http://localhost:${PORT:-3000}/healthz`

What happened?
- A MySQL database started.
- The app installed and started in dev mode.
- Database tables were created (migrations).
- An admin user was added (openId `admin-local`).

**What’s in the box**
- `client/` — React + Vite (TypeScript). UI components and pages live here.
- `server/` — Node/Express + tRPC. Entrypoint: `server/_core/index.ts`.
- `drizzle/` — Database schema + migrations.
- `shared/` — Types/constants shared by client and server.

**Environment (kept simple)**
Docker Compose provides safe defaults for dev and maps the same port on host and container:
- PORT: `3000` (use `PORT=3001 docker compose up` to run on 3001)
- HMR_PORT: `24678` (published for Vite HMR)
- `DATABASE_URL`: points to the `db` service
- `OWNER_OPEN_ID`: `admin-local` (used by seeding and dev login)
- `JWT_SECRET` and OAuth URLs: set to local placeholders
You can override by editing `.env`.

**Common Tasks**
- Stop: `Ctrl+C` in the terminal
- Start again: `docker compose up`
- Rebuild after changes: `docker compose up --build`
- Reset everything (erases DB): `docker compose down -v` then `docker compose up --build`

**Troubleshooting**
- Port busy: close other apps on your chosen PORT or run `PORT=3001 docker compose up` and open http://localhost:3001
- Connectivity: check `curl -i http://localhost:${PORT:-3000}/healthz` for a quick OK
- MySQL slow to start: just re-run `docker compose up` or wait a few seconds; the app waits and applies migrations automatically.
- Login loop: for local HTTP we set cookie SameSite correctly; use the dev-login link above. If it still loops, hard refresh or clear cookies for localhost.
- Health check (from your host machine): `pnpm health` — verifies Node, env, DB, and storage config.

**Database Browser (Adminer)**
- Open: `http://localhost:8080`
- System: MySQL
- Server: `db`
- Username: `root`
- Password: `root`
- Database: `deimudda`

**Non‑Docker (optional, later)**
- Install Node 20+ and `corepack enable && corepack prepare pnpm@10.4.1 --activate`
- `pnpm i`
- (Optional DB) run MySQL and set `DATABASE_URL` in `.env`
- `pnpm db:push`
- `pnpm dev`
- Visit `http://localhost:${PORT:-3000}/api/dev-login?openId=admin-local&name=Admin` then open `http://localhost:${PORT:-3000}`

**Sample data**
- We seed a seller (`seller-local`), a buyer (`buyer-local`), and two example listings so screens have content immediately.

**Notes on features**
- Image uploads: require configuring either built‑in storage (BUILT_IN_FORGE_*) or external storage (R2/B2). For first run, you can skip uploads.
- Tests: `pnpm test` (server-side Vitest). Type check: `pnpm check`. Format: `pnpm format`.

You’re ready. If you want a DB browser (Adminer) added to Docker, say the word and we’ll include it.
