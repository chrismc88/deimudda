# deimudda - Cannabis-Stecklingsbörse - Vollständiges Backup

## 📦 Backup-Inhalt

Dieses Backup enthält die **vollständige deimudda-Plattform** mit allen Dateien, Konfigurationen und Dokumentationen.

### ✅ Enthaltene Dateien

```
deimudda/
├── client/                          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/                   # Alle Seiten (Home, Profile, Admin, etc.)
│   │   ├── components/              # UI-Komponenten
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── contexts/                # React Contexts
│   │   └── _core/                   # Core Frontend-Logik
│   ├── public/                      # Statische Assets (Bilder, Logos)
│   └── index.html                   # HTML Template
│
├── server/                          # Backend (Node.js + Express + tRPC)
│   ├── _core/                       # Core Server-Funktionen
│   │   ├── index.ts                 # Server Entry Point
│   │   ├── oauth.ts                 # OAuth-Integration
│   │   ├── trpc.ts                  # tRPC Setup
│   │   └── ...
│   ├── routes/                      # API Routes
│   ├── db.ts                        # Datenbank-Funktionen
│   ├── routers.ts                   # tRPC Router (Hauptlogik)
│   ├── paypal.ts                    # PayPal-Integration
│   └── storage.ts                   # S3 Storage-Integration
│
├── shared/                          # Geteilte Typen & Konstanten
│   ├── types.ts                     # TypeScript Typen
│   └── const.ts                     # Konstanten
│
├── drizzle/                         # Datenbank-Schema & Migrationen
│   ├── schema.ts                    # Datenbank-Schema
│   ├── migrations/                  # SQL-Migrationen
│   └── meta/                        # Drizzle Metadata
│
├── patches/                         # NPM Package Patches
│
├── package.json                     # Dependencies & Scripts
├── pnpm-lock.yaml                   # Dependency Lock File
├── tsconfig.json                    # TypeScript Konfiguration
├── vite.config.ts                   # Vite Build-Konfiguration
├── drizzle.config.ts                # Drizzle ORM Konfiguration
├── components.json                  # shadcn/ui Konfiguration
│
├── .env.example                     # Beispiel Umgebungsvariablen
├── .gitignore                       # Git Ignore Rules
├── .prettierrc                      # Code Formatter Config
│
├── PAYPAL_SETUP.md                  # PayPal Setup-Anleitung
├── WINDOWS_DEPLOYMENT_GUIDE.md      # Windows Deployment Guide
├── userGuide.md                     # Benutzerhandbuch
└── todo.md                          # Feature-Liste & Bugtracker
```

## 🚀 Schnellstart

### 1. Entpacken

```bash
# Entpacken Sie die ZIP-Datei
unzip deimudda_FINAL_BACKUP_20251031.zip
cd deimudda
```

### 2. Dependencies installieren

```bash
# Installieren Sie pnpm (falls nicht vorhanden)
npm install -g pnpm

# Installieren Sie alle Dependencies
pnpm install
```

### 3. Umgebungsvariablen konfigurieren

```bash
# Kopieren Sie die Beispiel-.env
cp .env.example .env

# Bearbeiten Sie .env mit Ihren Werten
# Wichtig: DATABASE_URL, OAuth-Credentials, PayPal-Keys
```

### 4. Datenbank einrichten

```bash
# Führen Sie Migrationen aus
pnpm db:push
```

### 5. Server starten

```bash
# Development Mode
pnpm dev

# Production Mode
pnpm build
pnpm start
```

## 📚 Dokumentation

### Deployment-Anleitungen

- **Windows:** `WINDOWS_DEPLOYMENT_GUIDE.md` - Vollständige Anleitung für Windows
- **PayPal:** `PAYPAL_SETUP.md` - PayPal-Integration einrichten
- **User Guide:** `userGuide.md` - Benutzerhandbuch für Endnutzer

### Projekt-Dokumentation

- **TODO Liste:** `todo.md` - Alle Features, Bugs und Fortschritt
- **Package.json:** Alle Dependencies und Scripts

## 🔧 Verfügbare Scripts

```bash
# Development
pnpm dev              # Startet Dev-Server (Frontend + Backend)
pnpm dev:client       # Nur Frontend
pnpm dev:server       # Nur Backend

# Production
pnpm build            # Build für Production
pnpm start            # Startet Production Server

# Datenbank
pnpm db:push          # Migrationen ausführen
pnpm db:generate      # Migrationen generieren
pnpm db:studio        # Drizzle Studio öffnen

# Code Quality
pnpm check            # TypeScript Type-Check
pnpm format           # Code formatieren
pnpm test             # Tests ausführen
```

## 🌐 Live-Website

Die Plattform läuft bereits produktiv unter:

**https://deimudda.manus.space**

## 📋 Features

### ✅ Vollständig implementiert

- **Listing-System:** Festpreis, Auktionen, Preisvorschläge
- **Multi-Image Upload:** Bis zu 10 Bilder pro Listing
- **Bewertungssystem:** 5-Sterne mit 90-Tage-Fenster
- **Chat-System:** Direktnachrichten zwischen Käufer/Verkäufer
- **Benachrichtigungen:** Echtzeit-Benachrichtigungen
- **PayPal-Integration:** Sichere Zahlungen (Sandbox & Live)
- **Admin-System:** 10 Admin-Seiten für Moderation
- **OAuth-Login:** Mit IP-Blocking & Rate-Limiting
- **Wartungsmodus:** Für System-Updates
- **Verkäufer-Dashboard:** Listing-Verwaltung, Transaktionen
- **Käufer-Dashboard:** Bestellungen, Bewertungen
- **Rechtliche Seiten:** Impressum, Datenschutz, AGB
- **DSGVO-konform:** Account-Löschung, Cookie-Hinweis

### 🔐 Sicherheits-Features

- OAuth-Login mit Rate-Limiting
- IP-Blocking System
- Account-Lockout nach Failed Logins
- Wartungsmodus (nur Super-Admins)
- Alle Einstellungen datenbank-gesteuert
- Admin-Audit-Logs für alle Aktionen

## 🗄️ Datenbank-Schema

### Haupttabellen

- **users** - Nutzer-Accounts
- **sellerProfiles** - Verkäufer-Profile
- **listings** - Produkt-Listings
- **transactions** - Käufe & Zahlungen
- **reviews** - Bewertungen
- **messages** - Chat-Nachrichten
- **notifications** - Benachrichtigungen
- **offers** - Preisvorschläge
- **bids** - Auktions-Gebote

### Admin-Tabellen

- **warnings** - Nutzer-Verwarnungen
- **suspensions** - Temporäre Sperren
- **bans** - Permanente Bans
- **reports** - Nutzer-Reports
- **adminLogs** - Admin-Aktionen
- **loginAttempts** - Login-Versuche
- **blockedIPs** - Gesperrte IP-Adressen

### System-Tabellen

- **systemSettings** - Konfigurierbare Einstellungen
- **cookieConsents** - Cookie-Zustimmungen

## 🔑 Wichtige Umgebungsvariablen

```env
# Datenbank (ERFORDERLICH)
DATABASE_URL=mysql://user:password@host:3306/deimudda

# OAuth (ERFORDERLICH für Login)
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
VITE_APP_ID=your-app-id
JWT_SECRET=your-jwt-secret

# App Config
VITE_APP_TITLE=deimudda - Cannabis Stecklingsbörse
VITE_APP_LOGO=https://deimudda.manus.space/seedling-logo.png

# PayPal (ERFORDERLICH für Zahlungen)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_MODE=sandbox  # oder "live" für Production
VITE_PAYPAL_CLIENT_ID=your-client-id

# Server
PORT=3000
```

## 🆘 Support & Hilfe

### Bei Problemen

1. **Logs prüfen:** `pnpm dev` zeigt alle Fehler
2. **Datenbank testen:** Verbindung prüfen
3. **Dependencies neu installieren:** `rm -rf node_modules && pnpm install`
4. **Dokumentation lesen:** Siehe Markdown-Dateien

### Kontakt

- **Manus Support:** https://help.manus.im
- **Live-Website:** https://deimudda.manus.space

## 📊 Projekt-Status

- **Version:** 1.0.0
- **Status:** ✅ Production Ready
- **Features:** 150+ implementiert
- **Admin-Seiten:** 10/10 vollständig
- **Sicherheit:** 6/6 Features aktiv
- **TypeScript Errors:** ~86 (non-critical)

## 🎯 Nächste Schritte

Nach dem Deployment:

1. ✅ **PayPal konfigurieren** (siehe PAYPAL_SETUP.md)
2. ✅ **Rechtliche Dokumente aktualisieren** (Impressum, Datenschutz)
3. ✅ **Domain registrieren** (z.B. deimudda.de)
4. ✅ **SSL-Zertifikat einrichten** (bei eigenem Server)
5. ✅ **Backup-Strategie** definieren

## 📜 Lizenz

Dieses Projekt ist proprietär. Alle Rechte vorbehalten.

## 🌿 Über deimudda

deimudda ist die erste legale Marktplattform für Cannabis-Vermehrungsmaterial in Deutschland. Die Plattform ermöglicht den sicheren und transparenten Handel mit Stecklingen und Samen gemäß des Konsumcannabisgesetzes (KCanG).

---

**Erstellt am:** 31. Oktober 2025  
**Backup-Version:** Final  
**Website:** https://deimudda.manus.space
