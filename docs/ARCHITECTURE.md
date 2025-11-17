# Architektur – deimudda

Kurzüberblick über System-Design und Datenmodell.

## System
- Client: React + Vite (Routing via wouter, Layouts: DashboardLayout, BackButton)
- Server: Express + tRPC (Einstieg: `server/_core/index.ts`, Router: `server/routers.ts`)
- DB: MySQL via Drizzle (Schema: `drizzle/schema.ts`, Migrationen: `drizzle/*.sql`)
- Shared: Geteilte Typen/Konstanten in `shared/`

## Datenfluss
React Hook → tRPC Procedure → DB-Funktion (`server/db.ts`) → MySQL

## Wichtige Patterns
- tRPC-Procedures: `protectedProcedure`, `superAdminProcedure`
- Pagination: SQL `COUNT/LIMIT/OFFSET` → `{ items, total }`
- Geldwerte als `string` speichern (Decimal)
- Settings über `systemSettings`-Tabelle, Zugriff via `getSystemSetting(key)`

## Admin UI Überblick
Detailbeschreibungen der Admin-Seiten (Dashboard, Users, Listings, Fees, Limits, Sessions, Security, Reports, Logs) befinden sich in `docs/ADMIN_MODULES.md`. Jede Seite ist im Frontend (`client/src/pages/Admin*.tsx`) implementiert und über `/admin/...` erreichbar.

## Sicherheit
- Dev-Login per ENV `DEV_LOGIN_ENABLED` (dev an, prod aus)
- Rollen: user, seller, admin, super_admin
- Logs/Reports: `adminLogs`, `reports`, Security-Module
