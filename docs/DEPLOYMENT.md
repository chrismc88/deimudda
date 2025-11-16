# Deployment – deimudda

## Anforderungen
- MySQL DB erreichbar
- ENV Variablen gesetzt (siehe `server/_core/env.ts`)

## Schritte
1) `pnpm build` (Client + Server)
2) `pnpm start` (aus `dist/`)
3) Datenbankmigrationen: `pnpm db:push`

## Docker
- Compose-Datei `docker-compose.yml`
- `DEV_LOGIN_ENABLED` in Produktion auf `false`

## Monitoring
- Server-Logs prüfen
- Fehler via tRPC-Fehlermeldungen nachvollziehen
