# deimudda – Cannabis-Stecklingsbörse

Moderne Plattform zum Anbieten, Kaufen und Verwalten von Cannabis-Stecklingen mit Angebotssystem, Messaging, Admin-Tools und dynamischen Systemeinstellungen.

**Tech-Stack:** React + Vite · tRPC · Express · MySQL · Drizzle ORM

---

## ⚡ Quick Start

### Docker (empfohlen)
```bash
docker compose up --build
```
Danach `http://localhost:3000` (Vite) bzw. `http://localhost:3001` (Server) öffnen.

### Lokal
```bash
pnpm install
pnpm db:push
pnpm dev
```

---

## 📁 Projektstruktur

```
client/      React + Vite (Pages, Components, Hooks)
server/      Express + tRPC (db.ts, routers.ts, _core/* Infrastruktur)
drizzle/     DB-Schema & Migrationen (*.sql)
shared/      Geteilte Typen und Konstanten
docs/        Architektur-, API- und Deployment-Dokumentation
```

**Datenfluss:** React Hook → tRPC Procedure → DB-Funktion → MySQL

---

## 🚀 Kernmodule & Features

- **Offers** – Erstellen, Zähler, Akzeptieren inkl. Gebühren, Auto-Reduktion von Beständen.
- **Listings** – Aktivieren/Deaktivieren, Auto-Status bei Ausverkauf, Limits per Setting.
- **Messaging** – 1:1 Chat mit Unread Counter und Header-Badges.
- **Notifications** – Offer-/System-Events inkl. Cleanup-Job (`notification_retention_days`).
- **Admin Suite** – Benutzer, Listings, Reports, Security (IP-Blocking, Login-Logs) & System Settings (Fees, Limits, Sessions, Branding).
- **Sicherheit** – express-rate-limit, Login-Tracking (`loginAttempts`), IP-Blockierung, Dev-Login per Flag.

---

## 🛠 Entwicklungs-Kommandos

```bash
pnpm dev        # Dev-Server (API + integrierter Vite) auf Port 3001
pnpm build      # Frontend + Server builden
pnpm start      # Produktion aus dist/ starten
pnpm test       # Vitest (Unit/Integration)
pnpm check      # TypeScript
pnpm format     # Prettier
pnpm db:push    # Migrations generieren + anwenden
```

---

## 🔐 Environments & Dev-Login

In `.env`:
```env
DATABASE_URL=mysql://user:pass@host/db
DEV_LOGIN_ENABLED=true        # nur lokal!
PORT=3001
```

Dev-Login-Endpunkte (nur wenn `DEV_LOGIN_ENABLED=true`):
- `GET  /api/dev-login?openId=dev-user&name=Dev%20User`
- `POST /api/dev/admin-login { "email": "admin@test.com" }`

In Produktion ist der Dev-Login hart gesperrt; Rate-Limits + IP-Blocking greifen automatisch.

---

## ⚙️ Dynamische Settings & Admin-Pages

Alle Settings liegen in `systemSettings` und lassen sich über folgende Admin-Seiten verwalten:

| Seite | Keys / Bereich | Beschreibung |
|-------|----------------|--------------|
| **AdminFees** | `platform_fee_fixed`, `paypal_fee_percentage`, `paypal_fee_fixed` | Plattform- und PayPal-Gebühren |
| **AdminLimits** | `max_offers_per_listing`, `max_offers_per_user`, `min_offer_amount`, `max_listing_price`, `max_images_per_listing`, `image_max_size_mb`, `min_seller_rating` | Angebots- und Medienlimits |
| **AdminSessions** | `session_lifetime_days`, `ip_block_duration_hours`, `max_login_attempts`, `suspicious_activity_threshold`, `notification_retention_days` | Sessions, Security, Cleanup |
| **AdminSettings** | `site_name`, `site_description`, `admin_email`, `maintenance_mode`, `registration_enabled`, `require_listing_approval` | Branding & globale Plattformparameter |

Alle Updates laufen über `server/db.ts#updateSystemSetting` (Insert/Upsert inkl. Alias-Support).

---

## 📚 Dokumentation

- `STATUS.md` – Aktueller Stand & Health-Check
- `ROADMAP.md` – Chronologischer Fahrplan
- `SYSTEM_SETTINGS_ANALYSIS.md` – Übersicht aller Settings und Verwendung
- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/DEVELOPMENT.md`
- `PAYPAL_SETUP.md`, `AGENTS.md`, `CONSISTENCY_CHECK_REPORT.md`

---

**Branch:** `002-sandbox` · **Lizenz:** Internal Development · Letzte Aktualisierung: November 2025
