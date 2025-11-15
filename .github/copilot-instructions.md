# Copilot Instructions (deimudda)

These guidelines help AI coding Agents work effectively in this repo. Keep changes surgical and consistent with existing patterns.

## Architektur Überblick
- Monorepo mit vier Kernbereichen:
  - `client/`: React + Vite (TS). Routing via `wouter` in `client/src/App.tsx`. Gemeinsame Layouts: `DashboardLayout.tsx`, Navigation mit Sidebar + `BackButton.tsx` für Detailseiten.
  - `server/`: Node/Express + tRPC. Einstieg `server/_core/index.ts`. Geschäftslogik konzentriert in `server/db.ts`. API-Endpunkte gebündelt in `server/routers.ts` (tRPC Router).
  - `drizzle/`: Datenbankschema (`drizzle/schema.ts`) + Migrationen (`drizzle/*.sql`). Neue Einstellungen oder Tabellen immer als fortlaufende SQL-Datei hinzufügen.
  - `shared/`: Geteilte Typen/Konstanten zwischen Client und Server.
- Datenfluss: React ruft tRPC Hooks (z.B. `trpc.offer.getIncoming.useQuery`) → tRPC Procedure in `routers.ts` → DB-Funktion in `db.ts` → MySQL (Drizzle).
- System Settings: Key/Value in Tabelle `systemSettings`. Zugriff überall über `getSystemSetting(key)` in `db.ts`.

## Wichtige Muster
- **tRPC Procedures**: Verwende existierende Wrappers (z.B. `protectedProcedure`, `superAdminProcedure`). Neue Funktionen: erst DB-Hilfsfunktion in `db.ts`, dann Procedure in `routers.ts`, dann Hook im Client.
- **DB-Funktionen**: Zentral in `server/db.ts`. Keine direkten SQL-Statements in Routern – stattdessen eine klare Funktion wie `getOffersForSellerPaginated(...)` erstellen.
- **Pagination**: Muster: DB-Funktion mit `COUNT(*)`, `LIMIT` und `OFFSET` → Rückgabe `{ items, total }`. Im Router in Objekt `{ items, page, pageSize, total }` einbetten.
- **Offer-System**: Annahme (`acceptOffer`) erzeugt eine Transaktion (Fees via `systemSettings`). Ablaufzeiten dynamisch (`offer_expiration_days`). Platzhalter: `reduceListingQuantity` noch umzusetzen.
- **Migrations**: Neue Setting-Seeds als eigene Datei `drizzle/XXXX_description.sql`. Benenne fortlaufend; keine bestehenden SQL-Dateien ändern.
- **Fees / Einstellungen**: Fallback-Werte lokal im Code nur, wenn Setting fehlt. Besser Setting per Migration anlegen.
- **Component Conventions**: Dateien in `client/src/pages` PascalCase. Hooks beginnen mit `use` (z.B. `useAuth`). Keine Ein-Buchstaben-Variablen.

## Workflows & Kommandos
- Entwicklung: `pnpm dev` (Server watch + Vite Einbindung). Falls Docker genutzt: `docker compose up --build`.
- Build: `pnpm build` → Server Bundle + Client Dist, danach `pnpm start`.
- Tests: `pnpm test` (Vitest). Test-Dateien co-located: `*.test.ts(x)`. Bestehendes Beispiel: `server/offer.test.ts` (leer, kann gefüllt werden).
- Typcheck: `pnpm check`. Format: `pnpm format`. DB Migrationen: `pnpm db:push`.

## Erweiterungen Hinzufügen (Beispiel)
1. Neue Domain-Logik (z.B. "reports export"): Funktion `exportReports()` in `db.ts` erstellen.
2. Procedure in `routers.ts`: `reports.export` mit passendem `protectedProcedure`.
3. Client Hook: `trpc.reports.export.useQuery()` oder Mutation einbinden.
4. UI: Seite unter `client/src/pages/ReportsExport.tsx` mit bestehenden Layout-Komponenten.

## Fehlerbehandlung & Patterns
- tRPC Errors: Nutze `TRPCError` mit Codes (`NOT_FOUND`, `BAD_REQUEST`, `FORBIDDEN`). Kein Throw von puren Strings.
- Offer Status-Änderungen: Immer `respondedAt` setzen bei akzeptieren/ablehnen/counter.
- Konsistenz: Datumsfelder via `new Date()`. Geldwerte als `string` (wegen Decimal Schema) beim Insert.

## System Settings Beispiel
```ts
const raw = await getSystemSetting('paypal_fee_percentage');
const percentage = raw ? parseFloat(raw) / 100 : 0.0249;
```
Immer robust gegen `null` parsen.

## Tests (Empfohlenes Muster)
- Arrange: Seed minimal User/Listing/Offer über DB-Funktionen.
- Act: tRPC Procedure direkt über Router aufrufen (mit Mock-Context) oder DB-Funktion.
- Assert: Statusänderung / Transaktion vorhanden / Pagination zählt richtig.

## Häufige Stolpersteine
- Neue Migration vergessen → Einstellung `null` → Fallback greift unerwartet.
- Pagination im Speicher statt SQL → Performance bei Wachstum schlecht (bereits korrigiert bei Offers).
- Dezimalwerte: Immer `String()` beim Insert, sonst Typ-Konflikt.
- Dev-Login: Aktiv in Dev; nicht entfernen ohne OAuth-Alternative.

## Stil & Patches
- Minimal-invasive Änderungen: Keine unnötige Umformatierung fremder Blöcke.
- Ein Feature pro Patch / Commit (Conventional Commit Format: `feat(server): add paginated offers`).
- Kein Hinzufügen von Lizenz-Headern.

## Priorisierte Verbesserungen (Stand jetzt)
- `reduceListingQuantity` implementieren + im `acceptOffer` nutzen.
- Tests für Offer-Lifecycle & SystemSettings.
- Notifications bei neuen/akzeptierten Offers.

## Schnelle Referenz
- DB Schema: `drizzle/schema.ts`
- Geschäftslogik: `server/db.ts`
- API Router: `server/routers.ts`
- Client Einstieg: `client/src/main.tsx`, Routing `client/src/App.tsx`
- Settings Seed Beispiel: `drizzle/0010_offer_expiration_days.sql`

Bei Unklarheiten bitte nachfragen – diese Datei lebt von Iteration.
