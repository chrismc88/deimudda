# Repository Guidelines

## Project Structure & Module Organization
- `client/` — React + Vite app (TypeScript). UI in `client/src/components` and `client/src/components/ui`, pages in `client/src/pages`, utilities in `client/src/lib`.
- `server/` — Node/Express + tRPC backend. Entrypoint `server/_core/index.ts`; integrations in `server/_core/*` (env, db, llm, oauth, vite).
- `drizzle/` — Database schema and migrations (`drizzle/schema.ts`, `drizzle/relations.ts`, `drizzle/**.sql`).
- `shared/` — Cross‑shared types and constants.
- `patches/` — pnpm patch files.

## Build, Test, and Development Commands
- `pnpm dev` — Run backend in watch mode (tsx). Vite is wired via `server/_core/vite.ts` for the client dev experience.
- `pnpm build` — Build client (Vite) and bundle server to `dist/` (esbuild, ESM).
- `pnpm start` — Start production build from `dist/`.
- `pnpm test` — Run Vitest once (see `vitest.config.ts`).
- `pnpm check` — Type-check the repo with `tsc`.
- `pnpm format` — Format with Prettier.
- `pnpm db:push` — Generate and run Drizzle migrations.

## Coding Style & Naming Conventions
- Language: TypeScript everywhere; 2‑space indentation; ESM modules.
- Formatting: Prettier enforced; run `pnpm format` before PRs.
- React: Components and pages use PascalCase file names (e.g., `DashboardLayout.tsx`). Hooks start with `use*` (e.g., `useAuth`).
- Server: File names use camelCase within `server/_core` (e.g., `imageGeneration.ts`).
- Types: Prefer `zod` schemas at boundaries; colocate types in `shared/` when used by client and server.

## Testing Guidelines
- Runner: Vitest.
- Location: Co-locate tests with source as `*.test.ts` / `*.test.tsx` (e.g., `client/src/lib/utils.test.ts`).
- Scope: Unit test utilities and pure functions; mock network/DB where possible.
- Run: `pnpm test` (optionally `vitest --coverage` if you need a report).

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits: `feat(server): ...`, `fix(client): ...`, `chore(drizzle): ...`.
- PRs: Provide a clear description, link issues, include screenshots/GIFs for UI changes, and mention schema or env changes. Keep PRs focused and small.

## Security & Configuration Tips
- Secrets: Use `.env` (never commit). See `server/_core/env.ts` for required variables.
- Database: Configure via `drizzle.config.ts`; generate/migrate with `pnpm db:push`.
- Payments/Storage: See `PAYPAL_SETUP.md` and S3 config in server storage modules.

