# deimudda - Windows Deployment Guide

## 📋 Systemvoraussetzungen

### Erforderliche Software

1. **Node.js** (Version 22.x oder höher)
   - Download: https://nodejs.org/
   - Empfohlen: LTS Version
   - Prüfen: `node --version` in CMD/PowerShell

2. **pnpm** (Package Manager)
   - Installation nach Node.js: `npm install -g pnpm`
   - Prüfen: `pnpm --version`

3. **Git** (Optional, aber empfohlen)
   - Download: https://git-scm.com/download/win
   - Für Version Control

4. **MySQL** (Datenbank)
   - Option A: XAMPP (https://www.apachefriends.org/)
   - Option B: MySQL Community Server (https://dev.mysql.com/downloads/mysql/)
   - Option C: Cloud-Datenbank (z.B. PlanetScale, Railway)

## 🚀 Installation auf Windows

### Schritt 1: Projekt entpacken

1. Entpacken Sie `deimudda_complete_backup_XXXXXX.zip`
2. Verschieben Sie den Ordner nach `C:\Projects\deimudda`

### Schritt 2: Dependencies installieren

Öffnen Sie PowerShell oder CMD im Projekt-Ordner:

```powershell
cd C:\Projects\deimudda
pnpm install
```

**Hinweis:** Dies kann 2-5 Minuten dauern.

### Schritt 3: Datenbank einrichten

#### Option A: Lokale MySQL (XAMPP)

1. Starten Sie XAMPP Control Panel
2. Starten Sie MySQL
3. Öffnen Sie phpMyAdmin (http://localhost/phpmyadmin)
4. Erstellen Sie neue Datenbank: `deimudda`
5. Notieren Sie die Zugangsdaten:
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: (leer bei XAMPP Standard)
   - Database: `deimudda`

#### Option B: Cloud-Datenbank (PlanetScale - Empfohlen)

1. Registrieren Sie sich bei https://planetscale.com (kostenlos)
2. Erstellen Sie neue Datenbank: `deimudda`
3. Kopieren Sie die Connection String
4. Format: `mysql://user:password@host:3306/deimudda?ssl={"rejectUnauthorized":true}`

### Schritt 4: Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env` Datei im Projekt-Root:

```env
# Database
DATABASE_URL=mysql://root@localhost:3306/deimudda

# OAuth (Manus - wird automatisch bereitgestellt)
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
VITE_APP_ID=your-app-id-here
JWT_SECRET=your-jwt-secret-here

# App Configuration
VITE_APP_TITLE=deimudda - Cannabis Stecklingsbörse
VITE_APP_LOGO=https://deimudda.manus.space/seedling-logo.png

# PayPal (Sandbox für Tests)
PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-paypal-sandbox-secret
PAYPAL_MODE=sandbox
VITE_PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://umami.dev.ops.butterfly-effect.dev
VITE_ANALYTICS_WEBSITE_ID=your-analytics-id

# Server
PORT=3000
```

**Wichtig:** Ersetzen Sie die Platzhalter mit Ihren echten Werten!

### Schritt 5: Datenbank-Migrationen ausführen

```powershell
pnpm db:push
```

Dies erstellt alle Tabellen in der Datenbank.

### Schritt 6: Development Server starten

```powershell
pnpm dev
```

Die Website ist jetzt erreichbar unter: **http://localhost:3000**

## 🏗️ Production Build

### Build erstellen

```powershell
pnpm build
```

Dies erstellt optimierte Dateien im `dist/` Ordner.

### Production Server starten

```powershell
pnpm start
```

## 🔧 Troubleshooting

### Problem: "pnpm: command not found"

**Lösung:**
```powershell
npm install -g pnpm
```

### Problem: "Cannot connect to database"

**Lösung:**
1. Prüfen Sie, ob MySQL läuft
2. Überprüfen Sie die `DATABASE_URL` in `.env`
3. Testen Sie die Verbindung:
```powershell
mysql -u root -p -h localhost
```

### Problem: "Port 3000 already in use"

**Lösung:**
1. Ändern Sie `PORT=3001` in `.env`
2. Oder stoppen Sie den anderen Prozess:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problem: "Module not found" Fehler

**Lösung:**
```powershell
# Dependencies neu installieren
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Problem: OAuth funktioniert nicht lokal

**Lösung:**
OAuth erfordert eine öffentliche URL. Für lokale Entwicklung:
1. Nutzen Sie ngrok: https://ngrok.com/
2. Oder deployen Sie auf Manus: https://manus.im

## 📦 Deployment-Optionen

### Option 1: Manus WebDev (Empfohlen)

- Einfachstes Deployment
- Automatische SSL-Zertifikate
- Integrierte Datenbank
- OAuth bereits konfiguriert
- URL: https://deimudda.manus.space

**Schritte:**
1. Projekt in Manus hochladen
2. `Publish` klicken
3. Fertig!

### Option 2: Vercel

```powershell
# Vercel CLI installieren
npm install -g vercel

# Projekt deployen
vercel
```

**Wichtig:** Datenbank muss extern gehostet werden (PlanetScale empfohlen)

### Option 3: Railway

1. Registrieren bei https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Repository verbinden
4. Umgebungsvariablen hinzufügen
5. Deploy!

### Option 4: Eigener Windows Server (IIS)

1. IIS installieren
2. iisnode installieren: https://github.com/Azure/iisnode
3. Node.js App in IIS konfigurieren
4. PM2 für Prozess-Management: `npm install -g pm2`

```powershell
pm2 start dist/index.js --name deimudda
pm2 save
pm2 startup
```

## 🔐 Sicherheit für Production

### 1. Umgebungsvariablen sichern

- ❌ **NIEMALS** `.env` in Git committen
- ✅ Nutzen Sie `.env.example` als Template
- ✅ Speichern Sie Secrets sicher (z.B. 1Password, Bitwarden)

### 2. PayPal auf Live umstellen

```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
```

### 3. JWT Secret ändern

```powershell
# Generieren Sie einen sicheren Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. HTTPS erzwingen

In Production immer HTTPS nutzen:
- Manus: Automatisch
- Vercel/Railway: Automatisch
- Eigener Server: Let's Encrypt (https://letsencrypt.org/)

## 📊 Monitoring & Logs

### Logs anzeigen (Development)

```powershell
# Server-Logs
pnpm dev

# Datenbank-Logs
# In MySQL Workbench oder phpMyAdmin
```

### Logs anzeigen (Production mit PM2)

```powershell
pm2 logs deimudda
pm2 monit
```

## 🆘 Support

### Dokumentation

- **Launch-Leitfaden:** `deimudda_launch_leitfaden.pdf`
- **PayPal Setup:** `PAYPAL_SETUP.md`
- **User Guide:** `userGuide.md`
- **TODO Liste:** `todo.md`

### Hilfe bei Problemen

1. Prüfen Sie die Logs: `pnpm dev` zeigt Fehler an
2. Überprüfen Sie `.env` Konfiguration
3. Testen Sie Datenbank-Verbindung
4. Kontaktieren Sie Manus Support: https://help.manus.im

## 📝 Nächste Schritte

Nach erfolgreicher Installation:

1. ✅ **Testen Sie alle Features:**
   - Login/Registrierung
   - Listing erstellen
   - Bilder hochladen
   - PayPal-Zahlung (Sandbox)

2. ✅ **Konfigurieren Sie PayPal:**
   - Siehe `PAYPAL_SETUP.md`
   - Erstellen Sie Business Account
   - Wechseln Sie zu Live-Modus

3. ✅ **Rechtliche Dokumente aktualisieren:**
   - Impressum (`client/src/pages/Impressum.tsx`)
   - Datenschutz (`client/src/pages/Datenschutz.tsx`)
   - AGB (`client/src/pages/Nutzungsbedingungen.tsx`)

4. ✅ **Domain registrieren:**
   - Empfohlen: deimudda.de
   - Siehe Launch-Leitfaden

5. ✅ **Backup-Strategie:**
   - Datenbank: Täglich
   - Code: Git Repository
   - Uploads: S3/Cloud Storage

## 🎉 Fertig!

Ihre deimudda Cannabis-Stecklingsbörse ist jetzt einsatzbereit!

Bei Fragen oder Problemen: https://help.manus.im

---

**Version:** 1.0.0  
**Datum:** 31. Oktober 2025  
**Status:** Production Ready
