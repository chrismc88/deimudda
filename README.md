# deimudda – Cannabis-Stecklingsbörse

Moderne Plattform zum Anbieten, Kaufen und Verwalten von Cannabis-Stecklingen mit Angebotssystem, Messaging, Transaktionen und Admin-Tools.
## Integration Tests (DB required)

Some test files (e.g. `server/security.test.ts` and `server/offerSecurity.test.ts`) are integration tests that require a running MySQL database. When no DB is available the suites are soft-skipped and you will see warnings like:

```
	[security.test] Keine DB Verbindung – Tests werden übersprungen
```

To run these tests locally follow these steps (PowerShell examples):

1. Start a test database (Docker Compose or local MySQL). Example with Docker Compose:

```powershell
	docker compose up -d
```

2. Set `DATABASE_URL` pointing to your test DB (replace values):

```powershell
	#$env:DATABASE_URL = "mysql://user:password@127.0.0.1:3306/deimudda_test"
	$env:DATABASE_URL = "mysql://testuser:password@127.0.0.1:3306/deimudda_test"
```

3. Prepare schema and seeds (if required):

```powershell
	pnpm db:push
	# or run the seed migrations used by the project, for example:
	pnpm exec tsx scripts/apply-seed-migration.ts drizzle/0017_seed_site_name.sql
```

4. Run only the integration test files (or run full suite):

```powershell
	pnpm exec vitest run server/security.test.ts
	pnpm exec vitest run server/offerSecurity.test.ts
	# or run all tests
	pnpm test
```

Notes:
- Some unit tests use DB-mocks and may still log harmless TypeErrors (e.g. `db.insert is not a function`) when mocks don't implement every DB helper. If you want a clean integration run, ensure the real DB is used for the integration tests above.
- If you prefer, I can add a short script to spin up a throwaway MySQL container and run these integration tests automatically.
# deimudda – Cannabis-Stecklingsbörse

Moderne Plattform zum Anbieten, Kaufen und Verwalten von Cannabis-Stecklingen mit Angebotssystem, Messaging, Transaktionen und Admin-Tools.

**Stack:** React + Vite + tRPC + Express + MySQL + Drizzle ORM

---

## 🚀 Quick Start

### Docker (Empfohlen)
```bash
docker compose up --build
```
Öffne: `http://localhost:3000` (Port 3001 bei lokalem dev)  
Dev-Login: `/api/dev-login?openId=admin-local&name=Admin`

### Lokal
```bash
pnpm install
pnpm db:push
pnpm dev
```

---

## 📁 Struktur

```
client/     → React + Vite (wouter routing, DashboardLayout, BackButton)
server/     → Express + tRPC (Logik: db.ts, Router: routers.ts)
drizzle/    → Schema + Migrations (.sql Dateien)
shared/     → Geteilte Typen
```

**Datenfluss:** React Hook → tRPC Procedure → DB-Funktion → MySQL

---

## 🎯 Kern-Features

- **Angebote** – Erstellen, Counter, Akzeptieren mit Transaktionen & Fees
- **Listings** – Aktivieren/Deaktivieren, Auto-Status bei Ausverkauf
- **Messaging** – 1:1 Chat mit Unread Counter
- **Notifications** – Bei Offer-Aktionen mit Unread Badge (Cleanup nach Retention)
- **Admin** – User/Listing/Security/Report Management + System Settings
- **Concurrency** – In-Memory Lock bei Offer-Annahme

---

## 🛠️ Kommandos

```bash
pnpm dev        # Dev-Server starten (Port 3001)
pnpm build      # Production Build
pnpm start      # Prod Server starten
pnpm test       # Vitest Tests
pnpm check      # TypeScript Check
pnpm format     # Prettier
pnpm db:push    # Migrations ausführen
```

---

## 🔐 Wichtiges

### Dev-Login aktivieren

In `.env` setzen:
```env
DEV_LOGIN_ENABLED=true
PORT=3001
```

Dann Server (neu)starten:
```bash
pnpm dev
```

Zugriff:
- User: `http://localhost:3001/api/dev-login?openId=dev-user&name=Dev%20User`
- Admin: `http://localhost:3001/api/dev/admin-login?openId=admin-local&name=Admin`

**Wichtig:** In Production ist Dev-Login automatisch deaktiviert (Sicherheitssperre)

---

## ⚙️ Dynamische Settings

Diese Schlüssel liegen in `systemSettings` und werden zur Laufzeit genutzt:

**Gebühren**
- `platform_fee_fixed`, `paypal_fee_percentage`, `paypal_fee_fixed`

**Limits & Qualität**
- `min_offer_amount`, `max_offers_per_listing`, `max_offers_per_user`, `max_listing_price`, `min_seller_rating`

**Sicherheit & Sessions**
- `session_lifetime_days`, `ip_block_duration_hours`, `max_login_attempts`, `suspicious_activity_threshold`

**Benachrichtigungen**
- `notification_retention_days` → stündlicher Cleanup Job

**Auszahlung**
- `seller_payout_minimum` → Mindest-Auszahlungsbetrag (Validierung bei Offer-Akzept)

Neue Defaults: eigene Migration (`00XX_seed_*.sql`) anhängen, bestehende Dateien nicht ändern.

---

## ✅ Kürzlich implementiert

- Dynamische Gebühren (Fix + PayPal) durch Settings
- Admin-Seiten: Fees, Limits, Sessions
- Auto-Unblock von IPs nach Laufzeit (`ip_block_duration_hours`)
- Dynamischer Login-Rate-Limiter (`max_login_attempts`)
- Notification Cleanup (`notification_retention_days`)
- Seller Payout Minimum (`seller_payout_minimum`)
- Globales Mindestangebot (`min_offer_amount`) Client + Server Validierung

---

## 📚 Weitere Docs

- STATUS.md – Aktueller Projekt-Status
- docs/ – Architektur, API, Development, Deployment
- AGENTS.md – Guidelines für AI Agents
- PAYPAL_SETUP.md – PayPal Integration
- .github/copilot-instructions.md – Repo-spezifische Patterns

---

**Status:** ~92% fertig | **Branch:** 002-sandbox | **Lizenz:** Internal Development
# deimudda – Cannabis Stecklingsbörse

Moderne Plattform zum Anbieten, Kaufen und Verwalten von Cannabis-Stecklingen mit Angebotssystem, Messaging, Transaktionen und Admin-Tools.

**Stack:** React + Vite + tRPC + Express + MySQL + Drizzle ORM

---

## 🚀 Quick Start

### Docker (Empfohlen)
```bash
docker compose up --build
```
Öffne: `http://localhost:3000` (Port 3001 bei lokalem dev)  
Dev-Login: `/api/dev-login?openId=admin-local&name=Admin`

### Lokal
```bash
pnpm install
pnpm db:push
pnpm dev
```

---

## 📁 Struktur

```
client/     → React + Vite (wouter routing, DashboardLayout, BackButton)
server/     → Express + tRPC (Logik: db.ts, Router: routers.ts)
drizzle/    → Schema + Migrations (.sql Dateien)
shared/     → Geteilte Typen
```

**Datenfluss:** React Hook → tRPC Procedure → DB-Funktion → MySQL

---

## 🎯 Kern-Features

- **Angebote** – Erstellen, Counter, Akzeptieren mit Transaktionen & Fees
- **Listings** – Aktivieren/Deaktivieren, Auto-Status bei Ausverkauf
- **Messaging** – 1:1 Chat mit Unread Counter
- **Notifications** – Bei Offer-Aktionen mit Unread Badge
- **Admin** – User/Listing/Security/Report Management + System Settings
- **Concurrency** – In-Memory Lock bei Offer-Annahme

---

## 🛠️ Kommandos

```bash
pnpm dev        # Dev-Server starten (Port 3001)
pnpm build      # Production Build
pnpm start      # Prod Server starten
pnpm test       # Vitest Tests
pnpm check      # TypeScript Check
pnpm format     # Prettier
pnpm db:push    # Migrations ausführen
```

---

## 🔐 Wichtiges

### Dev-Login aktivieren

In `.env` setzen:
```env
DEV_LOGIN_ENABLED=true
PORT=3001
```

Dann Server (neu)starten:
```bash
pnpm dev
```

Zugriff:
- User: `http://localhost:3001/api/dev-login?openId=dev-user&name=Dev%20User`
- Admin: `http://localhost:3001/api/dev/admin-login?openId=admin-local&name=Admin`

**Wichtig:** In Production ist Dev-Login automatisch deaktiviert (Sicherheitssperre)


## 📚 Weitere Docs\n\n- STATUS.md – Aktueller Projekt-Status\n- docs/ – Architektur, API, Development, Deployment\n- AGENTS.md – Guidelines für AI Agents\n- PAYPAL_SETUP.md – PayPal Integration\n- .github/copilot-instructions.md – Repo-spezifische Patterns\n\n---\n\n**Status:** ~92% fertig | **Branch:** 002-sandbox | **Lizenz:** Internal Development\n
