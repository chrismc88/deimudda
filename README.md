**deimudda – Cannabis Stecklingsbörse**

Modernes Monorepo (TypeScript) für eine Plattform zum Anbieten, Kaufen und Verwalten von Cannabis-Stecklingen inkl. Angebots‑, Transaktions‑, Messaging‑, Admin‑ und Benachrichtigungssystem.

---
## 🚀 Quick Start (Docker)
1. Docker Desktop starten
2. Im Projektordner:
   ```bash
   docker compose up --build
   ```
3. Warten bis die Konsole den Server meldet (Standard Port aktuell `3001` bei lokalem `pnpm dev`, Docker nutzt standardmäßig `3000`).
4. Dev-Login (nur Entwicklung):
   `http://localhost:${PORT:-3000}/api/dev-login?openId=admin-local&name=Admin`
5. Anwendung öffnen: `http://localhost:${PORT:-3000}` → Health: `/healthz`

Was passiert dabei?
- MySQL Container startet und Migrations laufen
- Seed für Admin/Seller/Buyer User
- Server + Vite (HMR) aktiv
- Dev-Login Endpunkte verfügbar (falls nicht deaktiviert)

Reset (Achtung: Daten weg):
```bash
docker compose down -v && docker compose up --build
```

---
## 🧩 Architektur Überblick
- `client/` React + Vite (Routing via `wouter`, Layout: `DashboardLayout`, Navigation: Sidebar + BackButton)
- `server/` Express + tRPC; Geschäftslogik zentral in `server/db.ts`; Router in `server/routers.ts`
- `drizzle/` Schema + Migrations (fortlaufende .sql Dateien, keine nachträglichen Änderungen)
- `shared/` Geteilte Typen & Konstanten

Fluss: React Hook (`trpc.offer.getIncoming.useQuery`) → tRPC Procedure → DB-Funktion → MySQL.

System Settings (Key/Value): Zugriff überall über `getSystemSetting(key)`.

---
## 🏗️ Kern-Features
- Angebote (Lifecycle: erstellen, counter, akzeptieren, ablehnen, automatisch ablaufen, Transaktion + Gebührenberechnung)
- Listings (Aktivieren/Deaktivieren, Menge, Status „sold“ bei letzter Einheit, Bilder-Upload vorbereitet)
- Transaktionen (Fee‑Berechnung via Settings, PayPal Grundintegration)
- Messaging (1:1 Chat, ungelesen Zähler, BackButton Navigation)
- Notifications (Erzeugt bei Offer-Aktionen, Anzeige + Unread Count)
- Admin System (User-, Listing-, Security-, Report-, Log-, Settings‑Management, Rollenwechsel, IP Blocking)
- Reports & Moderation (Melden von Listings/Users, Statusupdate, Logging)
- System Settings (17+ konfigurierbare Parameter für Fees, Limits, Security)
- Concurrency Schutz (In‑Memory Lock bei Offer‑Annahme + atomarer Mengenreduktionsversuch)

---
## 🧪 Tests
- Vitest: `pnpm test`
- Abgedeckt: Offer Lifecycle (inkl. Concurrency + Pagination + Mengenreduktion), Basis DB Funktionen
- Geplant: Notifications, AdminLogs, Reports, E2E Flow, Security Hardening

---
## 🛠️ Entwicklung (Non‑Docker)
```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install
pnpm db:push
pnpm dev   # startet Server + Vite (aktuell Port 3001)
```

Wichtige Kommandos:
- Build: `pnpm build` → danach `pnpm start`
- Format: `pnpm format`
- Typecheck: `pnpm check`
- Migrations generieren/ausführen: `pnpm db:push`

---
## 🔐 Sicherheit / Dev-Login
Dev-Login Endpunkte: `/api/dev-login`, `/api/dev/admin-login` (aktiv in Entwicklung). Deaktivieren via `.env`:
```env
DEV_LOGIN_ENABLED=false
```
In Produktion automatisch deaktiviert (`NODE_ENV=production`).

---
## ⚙️ Wichtige Settings (Beispiele)
```ts
const rawFee = await getSystemSetting('paypal_fee_percentage');
const paypalFeePercent = rawFee ? parseFloat(rawFee) / 100 : 0.0249;
```
Fallbacks nur wenn Setting fehlt – neue Werte als Migration hinzufügen.

---
## 📦 Datenbank (Drizzle)
- Tabellen u.a.: users, sellerProfiles, listings, offers, transactions, messages, notifications, reports, adminLogs, systemSettings
- Änderungen: neue Migration Datei hinzufügen (niemals alte verändern)

---
## 🧠 Offer System Kurzablauf
1. Erstellung → Ablaufzeit dynamisch über Setting (`offer_expiration_days`)
2. Counter → neue Ablaufzeit
3. Antwort → akzeptieren erzeugt Transaktion (Fees) + reduziert Menge
4. Menge 0 → Listing Status `sold`
5. Lock verhindert doppelte Annahme

---
## 📝 To‑Do (High Level)
- Rebuild `OfferManagement` Page (Frontend)
- OAuth Integration (ersetzt Dev-Login)
- PayPal Live & Webhooks
- Tests erweitern (Notifications, AdminLogs, Reports, E2E)
- Security Hardening (Rate Limit, Headers, Body Size, CSRF)
- Performance (Caching, Query Optimierung, Bilder/CDN)

---
## 🐞 Troubleshooting
- Port belegt → anderen setzen: `PORT=3001 docker compose up`
- MySQL langsam → Neustarten oder warten; Migrations laufen automatisch
- Login Loop → Cookies löschen / Dev-Login Link erneut
- Health Check: `curl -i http://localhost:${PORT:-3000}/healthz`

---
## 🔍 Adminer (DB Browser)
`http://localhost:8080`  (Server: `db`, User: `root`, PW: `root`, DB: `deimudda`)

---
## 📄 Lizenz / Rechtliches
Interne Entwicklungsphase – Lizenz/AGB Texte in separaten Legal Pages (`Terms`, `Privacy`, `Impressum`).

---
## ✅ Status Snapshot (15. Nov 2025)
- Gesamtfortschritt ~92% (vor Launch: OAuth + Hardening + OfferManagement Page)

---
## 🤝 Beiträge
Konventionelle Commits (`feat(server): ...`). Kleine fokussierte Patches. Keine bestehenden Migrationen ändern.

---
## ✔ Schnellreferenz
`server/db.ts` Geschäftslogik
`server/routers.ts` tRPC Router
`drizzle/schema.ts` Schema
`client/src/App.tsx` Routing
`client/src/components/DashboardLayout.tsx` Layout

---
Fragen? → Siehe `PROJECT_STATUS.md`, `TODO.md` oder interne Docs im Ordner `deimudda_final_reconstruction_package/`.
