# deimudda - Cannabis Stecklingsbörse Benutzerhandbuch

## Übersicht

**Zweck:** deimudda ist eine Online-Plattform für den legalen Handel mit Cannabis-Stecklingen und -Samen in Deutschland. Nutzer können Angebote durchsuchen, kaufen und als Verkäufer eigene Listings erstellen.

**Zugriff:** Öffentliche Plattform mit Login-Pflicht für Käufe und Verkäufe.

## Powered by Manus

deimudda wurde mit modernster Technologie entwickelt:

**Frontend:** React 19 + TypeScript + Vite mit Radix UI-Komponenten für eine professionelle Benutzeroberfläche. Framer Motion für flüssige Animationen und TailwindCSS für responsives Design.

**Backend:** Node.js + Express + tRPC für typsichere API-Kommunikation. Drizzle ORM für effiziente Datenbankoperationen.

**Datenbank:** MySQL mit vollständiger Relationsverwaltung für Nutzer, Listings, Transaktionen, Bewertungen, Nachrichten und Admin-Logs.

**Authentifizierung:** OAuth-basiertes Login-System mit IP-Blocking, Rate-Limiting und Wartungsmodus-Unterstützung.

**Zahlungen:** PayPal-Integration für sichere Transaktionen mit automatischer Gebührenberechnung.

**Storage:** S3-kompatibler Cloud-Storage für Bild-Uploads mit automatischer Komprimierung.

**Deployment:** Auto-scaling Infrastruktur mit globalem CDN für schnelle Ladezeiten weltweit.

## Nutzung der Website

### Als Käufer

Besuchen Sie die Startseite und klicken Sie auf "Stecklinge durchsuchen". Nutzen Sie die Filter für Sorte, Preis und Verkäuferstandort. Klicken Sie auf ein Listing für Details. Bei Festpreis klicken Sie "Jetzt kaufen", bei Auktionen "Gebot abgeben", bei Preisvorschlägen "Angebot machen". Nach dem Kauf erhalten Sie eine Benachrichtigung und können den Verkäufer per Chat kontaktieren.

### Als Verkäufer

Klicken Sie auf "Verkäufer werden" im Profil-Menü. Füllen Sie Shop-Name und Beschreibung aus. Nach Aktivierung klicken Sie "Neues Listing erstellen". Geben Sie Sorte, Preis, Beschreibung und laden Sie Bilder hoch. Wählen Sie zwischen Festpreis, Auktion oder Preisvorschlägen. Ihre Listings erscheinen im Verkäufer-Dashboard unter "Meine Listings".

### Bewertungssystem

Nach erfolgreichem Kauf können Sie den Verkäufer innerhalb von 90 Tagen bewerten. Klicken Sie im Käufer-Dashboard auf "Bewerten". Geben Sie 1-5 Sterne und einen Kommentar ab. Verkäufer sehen ihre Bewertungen im Verkäufer-Dashboard.

## Verwaltung der Website

### Management UI

Öffnen Sie das Management UI über das Icon in der Chatbox-Kopfzeile. Hier finden Sie:

**Preview:** Live-Vorschau der Website mit persistentem Login-Status.

**Code:** Dateibaum mit Download-Option für alle Dateien.

**Dashboard:** Status-Monitor, Sichtbarkeitseinstellungen und Analytics (UV/PV) für veröffentlichte Sites.

**Database:** CRUD-Interface für direkte Datenbankoperationen. Verbindungsinfo in den Einstellungen (SSL aktivieren empfohlen).

**Settings:** 
- General: Website-Name und Logo (VITE_APP_TITLE/VITE_APP_LOGO)
- Domains: Domain-Präfix ändern oder eigene Domain verbinden
- Notifications: Benachrichtigungseinstellungen für die integrierte API
- Secrets: ENV-Variablen anzeigen, bearbeiten und löschen

### Admin-System

Super-Admins haben Zugriff auf das Admin-Dashboard mit:
- Nutzer-Verwaltung (Verwarnungen, Sperren, Bans)
- Listing-Moderation
- Transaktions-Überwachung
- Report-Bearbeitung
- System-Einstellungen (Gebühren, Limits, Wartungsmodus)
- IP-Blocking und Login-Sicherheit

## Nächste Schritte

Sprechen Sie jederzeit mit Manus AI, um Änderungen anzufordern oder neue Features hinzuzufügen.

### Produktionsbereitschaft

Vor dem Live-Gang sollten Sie folgende Test-API-Keys aktualisieren:

**PayPal:** Aktualisieren Sie PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET und PAYPAL_MODE in Settings → Secrets. Produktions-Keys erhalten Sie im PayPal Developer Dashboard.

Holen Sie sich Produktions-Keys von den jeweiligen Service-Websites, bevor Sie live gehen.

Beginnen Sie jetzt mit dem Durchsuchen von Listings oder erstellen Sie Ihr erstes Verkäufer-Profil!
