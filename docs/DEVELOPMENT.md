# Development – deimudda

## Setup
```bash
pnpm install
pnpm db:push
pnpm dev
```
Docker: `docker compose up --build`

## Workflows
- Commits: Conventional Commits (`feat(server): ...`)
- Lint/Format: `pnpm check`, `pnpm format`
- Tests: `pnpm test` (Vitest), Tests co-located `*.test.ts(x)`

## Environments
- Dev-Login toggeln: ENV `DEV_LOGIN_ENABLED` (dev an, prod aus)
- Env-Variablen siehe `server/_core/env.ts`

## Tipps
- Pagination immer in SQL
- Decimal als `string` inserten
- Settings migrations statt Code-Fallbacks
