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


### Dev-Login toggeln

- PowerShell (Windows):
```powershell
$env:DEV_LOGIN_ENABLED = "false"; pnpm dev   # deaktivieren
$env:DEV_LOGIN_ENABLED = "true"; pnpm dev    # aktivieren
```

- Bash/Zsh (macOS/Linux):
```bash
DEV_LOGIN_ENABLED=false pnpm dev   # deaktivieren
DEV_LOGIN_ENABLED=true pnpm dev    # aktivieren
```

- Docker Compose: in `docker-compose.yml` oder `.env`
```yaml
environment:
	- DEV_LOGIN_ENABLED=false
```


## 📚 Weitere Docs

- `AGENTS.md` – Guidelines für AI Agents
- `TODO.md` – Offene Aufgaben
- `PROJECT_STATUS.md` – Fortschritt & Status
- `PAYPAL_SETUP.md` – PayPal Integration
- `.github/copilot-instructions.md` – Repo-spezifische Patterns

---

**Status:** ~92% fertig | **Branch:** 002-sandbox | **Lizenz:** Internal Development
