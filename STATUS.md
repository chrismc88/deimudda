# deimudda – Projekt-Status (Stand: 16.11.2025)

Kurzer, aktueller Überblick über Features, Roadmap und offene Punkte.

## Übersicht
- Status: Gelb — Kernfunktionen laufen lokal; Tests/Migrationen/Polish offen
- Stack: React + Vite + tRPC + Express + MySQL + Drizzle
- Fokus: Navigation/Notifications stabil, Settings via Migrationen, Tests ergänzen

## Features
| Bereich | Status | Notizen |
|---|---|---|
| Angebote | Aktiv | Counter/Accept inkl. Fees; Angebotsverwaltung (OfferManagement) aktiv |
| Listings | Aktiv | Aktivieren/Deaktivieren; Auto-Status bei Ausverkauf |
| Messaging | Aktiv | 1:1 Chat, Unread Counter |
| Notifications | Aktiv | Offer-/System-Events, Bell + Fallback-Navigation |
| Admin | Aktiv | User/Listing/Security/Reports/Settings |

| Roadmap (6–8 Wochen)
1) Tests ergänzen (Offers + `systemSettings`), Vitest laufen lassen
2) Settings sicher seeden (neue Drizzle-Migrationen), Fallbacks reduzieren
3) Polish & Doku-Abgleich

## Known Issues
- Fehlende Settings können Fallbacks triggern → Migrationen ergänzen
- Dezimalwerte nur als `String()` inserten → sonst Typkonflikte
- Pagination immer SQL-basiert (COUNT/LIMIT/OFFSET) → Performance

## Contributing (Kurz)
- `pnpm dev` (lokal) oder `docker compose up --build`
- Branch: `002-sandbox`; Commits: Conventional Commits
- Lint/Format: `pnpm check`, `pnpm format`

## Referenzen
- Code: `client/`, `server/`, `drizzle/schema.ts`, `server/routers.ts`, `server/db.ts`
- Doku: `README.md`, `docs/` (Architektur, API, Development, Deployment)
