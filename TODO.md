# Deimudda - Entwicklungs-Status & Roadmap

**Stand:** 16. November 2025  
**Projekt-Fortschritt:** ~95% COMPLETE 🎯  
**Nächste Priorität:** Tests & Polish

---

## 🚨 KRITISCH - Sofort beheben

### Tests & Polish
- Tests für Offers & systemSettings ergänzen
- Settings sicher seeden, Fallbacks reduzieren

---

## ✅ Phase 1: Core Platform (ABGESCHLOSSEN)

### Backend Infrastructure
- ✅ Express + tRPC Server Setup
- ✅ MySQL Database mit Drizzle ORM
- ✅ JWT Session Management
**Nächste Priorität:** Tests für Offers & Settings, Polish, Doku-Abgleich
- ✅ Vite Dev-Server Integration
## 🚨 KRITISCH
- Keine akuten Compile-Fehler offen
- Fokus: Sicherheitshärtung & fehlende Seite `OfferManagement.tsx`
- ✅ `listings` - Anzeigen/Listings
### Frontend Pages Status:
- ✅ `Messages` / `ChatWindow` / `Notifications` implementiert
- ✅ `OfferManagement` (Angebotsverwaltung) implementiert und aktiv
- ✅ `warnings` - Verwarnungen
### Frontend Components:
- ✅ `Header` / `MessageIcon` / `NotificationBell` integriert
- ✅ `blockedIPs` - IP-Sperren
## 🔄 Aktuelle Phase: Abschluss & Hardening
Messaging + Notifications abgeschlossen (Backend + Frontend). Angebotsverwaltung (OfferManagement) ist aktiv und zeigt alle relevanten Angebote. Nächste Schritte: Tests ergänzen, Settings seeden, Polish, Doku-Abgleich.
- ✅ `systemSettings` - System-Einstellungen
#### OfferManagement Neuaufbau (Geplant)
- Seite Layout + Listing Offer Übersicht
- Hooks für eingehende/ausgehende Offers (Pagination)
- Aktionen (accept/reject/counter/respond)
- Integration Notifications (bereits aktiv)
- ✅ `Impressum` - Impressum (109 Zeilen, vollständig)
**Backend Basis vorhanden (Offers/Messages/Notifications).**
- ✅ `Notifications` - Benachrichtigungen (implementiert)
Benachrichtigungs-Frontend abgeschlossen (Seite + Bell).
- ✅ `AdminStats` - Business Intelligence & Analytics Dashboard
- ✅ `AdminSecurity` - IP-Blocking & Security-Logs
### PayPal Integration vervollständigen (Priorität: MITTEL)
- ✅ `AdminNav` - Navigation zwischen Admin-Modulen
## 🗑 Bereinigte Alte Planungssektionen
- ✅ `DevAdminLogin` - Dev-Login für Admin-Testing
### (entfernt – abgeschlossen)

### (konsolidiert oben)
### Admin Backend (25+ Procedures)
### (entfernt – abgeschlossen)
- ✅ `getStats` - Dashboard-Statistiken
### (entfernt – abgeschlossen)
- ✅ `getAllUsers` - User-Liste mit Filterung
- ✅ `warnUser/suspendUser/banUser` - User-Moderation
- ✅ `promoteToSeller/demoteFromSeller` - Rollen-Management
### Was funktioniert:
- ✅ `getAllTransactions` - Transaktions-Übersicht
- ✅ `getAllListings` - Alle Listings für Moderation
### Was noch fehlt:
- Tests für Offers & Settings
- Settings sind vollständig per Migration abgedeckt (drizzle/*.sql)
- Fallbacks im Code sind minimal und dienen nur als Backup
- Polish & Doku-Abgleich

### Development URLs:
- ✅ Test-Admin Auto-Creation (`admin@test.com`)
- ✅ Dev-Login Endpoints (`/api/dev-login`, `/api/dev/admin-login`)
- `/admin/test` - Testing Page
  
### Tests (aktuell):
- `pnpm test` (10 grüne Offer/Concurrency/Pagination/Mengen-Tests)
- Ausstehend: Notifications/AdminLogs/Reports Assertions

### Geplante Test-Erweiterung:
1. Notification Hooks (Unread Count / Creation)
2. AdminLogs Retrieval + Filtering
3. Reports Lifecycle (pending → resolved)
4. OfferManagement UI Interaktionen (E2E)

### Security Hardening TODO:

#### KRITISCH - IP-Blocking (Nicht funktionsfähig)
- ❌ **IP-Blocking Funktionen implementieren** (db.ts Zeilen 1847-1866 sind Platzhalter)
  - blockIP(): INSERT INTO blockedIPs mit reason und adminId
  - unblockIP(): UPDATE blockedIPs SET unblockedAt, unblockedBy
  - getBlockedIPs(): SELECT from blockedIPs WHERE unblockedAt IS NULL
  - getIPsWithMostAttempts(): Query loginAttempts gruppiert nach IP
- ❌ **IP-Blocking Middleware** - Check incoming IP against blockedIPs table
- ❌ **Login-Attempt-Tracking** - INSERT INTO loginAttempts bei jedem Login-Versuch
- ❌ **Auto-Block nach X failed attempts** (via systemSettings konfigurierbar)

#### KRITISCH - Security-Middleware (Komplett fehlend)
- ❌ **helmet** - Security Headers (CSP, HSTS, X-Frame-Options, etc.)
- ❌ **cors** - Cross-Origin Configuration
- ❌ **express-rate-limit** - Globales Rate Limiting (z.B. 100 req/15min per IP)
- ❌ **Rate Limiting für Login-Endpoints** (5 attempts/15min)
- ❌ **IP-Extraktion Middleware** - X-Forwarded-For Header Parsing

#### HOCH - Auth/Session Risiken
- ⚠️ **Dev-Login Endpoints** - Sicherstellen DEV_LOGIN_ENABLED=false in Production
- ⚠️ **Session-Expiry zu lang** - ONE_YEAR_MS (31.5M ms = 1 Jahr) → 7-14 Tage empfohlen
- ⚠️ **Refresh-Token Pattern** erwägen für bessere Security

#### MITTEL - Weitere Hardening-Maßnahmen
- Body Size Limit reduzieren (aktuell 50MB → <10MB empfohlen)
- CSRF Schutz (Double Submit Token oder Origin Check)
- Einheitliches Error Mapping (keine raw stack traces in Production)

### Performance TODO:
- Query Optimierung (JOIN Vorab-Ladung für Listing Karten)
- Caching Layer (Redis für Settings & Unread Counts)
- Bildoptimierung (on-upload resize + WebP)

---
**Letzte Aktualisierung:** 15. November 2025, 23:30 CET

## 🔄 Phase 3: Messages & Notifications (IN PROGRESS - PRIORITÄT 1)

**Backend-Status:** 100% COMPLETE ✅  
**Frontend-Status:** 0% (komplett fehlend) ❌  
**Restarbeit:** 25-35 Stunden

### 1. Messages & Chat System (Priorität: KRITISCH) 💬
**Status:** Backend fertig (DB + Router + 10+ Functions), Frontend fehlt komplett

#### Sofort zu erstellen:
- ❌ `Messages.tsx` (15-20h)
  - Conversation-List mit Vorschau
  - Filter: Alle/Ungelesen/Archiviert
  - Unread-Counter pro Conversation
  - Click → Öffnet ChatWindow
  - tRPC: `chat.getConversations()`
  
- ❌ `ChatWindow.tsx` (10-15h)
  - Chat-Interface mit Message-History
  - Message-Input mit Send-Button
  - Real-time Updates (Polling alle 5 Sek)
  - Listing-Info-Header (Titel, Preis, Bild)
  - Scroll-to-Bottom bei neuen Messages
  - tRPC: `chat.getMessages()`, `chat.sendMessage()`
  
- ❌ `MessageIcon.tsx` (2-3h)
  - Header-Badge mit Unread-Count
  - Click → Navigiert zu /messages
  - Red Badge bei Unread > 0
  - tRPC: `chat.getUnreadCount()`
  
- ❌ Route `/messages` in App.tsx hinzufügen
- ❌ Route `/messages/:conversationId` in App.tsx hinzufügen

**Backend (bereits implementiert ✅):**
- ✅ `chat.getOrCreateConversation()` - Conversation starten
- ✅ `chat.sendMessage()` - Nachricht senden
- ✅ `chat.getMessages()` - Chat-History laden
- ✅ `chat.getConversations()` - Alle Conversations
- ✅ `chat.getUnreadCount()` - Ungelesene Zählen

**Verkäufer-Namensdarstellung:**
- ⏳ Im Chat sollen aktive Verkäufer als `ShopName (Nickname)` angezeigt werden (Identitäts-Klarheit)

### 2. Notifications System (Priorität: HOCH) 🔔
**Status:** Backend fertig (DB + Router + 8+ Functions), Frontend fehlt komplett

#### Sofort zu erstellen:
- ❌ `Notifications.tsx` (8-10h)
  - Notification-List (Alle/Ungelesen)
  - Mark as Read/Unread Buttons
  - Delete-Funktionalität
  - Filter & Sortierung
  - Pagination (falls > 50)
  - tRPC: `notifications.getMyNotifications()`, `notifications.markAsRead()`, `notifications.deleteNotification()`
  
- ❌ `NotificationBell.tsx` (5-7h)
  - Header-Badge mit Unread-Count
  - Dropdown mit letzten 5 Notifications
  - "Alle anzeigen" Button → /notifications
  - "Alle als gelesen markieren" Button
  - Red Badge bei Unread > 0
  - tRPC: `notifications.getUnreadCount()`, `notifications.getMyNotifications({ limit: 5 })`
  
- ❌ Route `/notifications` in App.tsx hinzufügen

**Backend (bereits implementiert ✅):**
- ✅ `notifications.getMyNotifications()` - Alle Benachrichtigungen
- ✅ `notifications.getUnreadCount()` - Ungelesene zählen
- ✅ `notifications.markAsRead()` - Als gelesen markieren
- ✅ `notifications.markAllAsRead()` - Alle als gelesen
- ✅ `notifications.deleteNotification()` - Löschen

---

## ⏳ Phase 4: Final Features (NÄCHSTE WOCHE)

### 3. Image Upload System (Priorität: MITTEL)
- ⏳ Frontend: MultiImageUpload Component fertigstellen (bereits vorhanden, funktional)
- ⏳ Backend: Storage-Integration (R2/B2 statt In-Memory)
- ⏳ Backend: Image-Optimierung (Resize, Compress)
- ⏳ Backend: Image-Validierung (Format, Größe, Content)
- ⏳ Frontend: Drag & Drop Support erweitern
- ⏳ Frontend: Image-Preview & Cropping

### 4. PayPal Integration vervollständigen (Priorität: MITTEL)
- ⏳ Sandbox Testing
- ⏳ Order Creation Flow testen
- ⏳ Payment Capture testen
- ⏳ Webhook Handler implementieren
- ⏳ Refund System
- ⏳ Transaction Status Updates
- ⏳ Email-Benachrichtigungen

---

## 🔄 Phase 3 (ALTE VERSION - ERLEDIGT)

### 1. Messages & Chat System (Priorität: HOCH) 💬
**Status:** Backend fertig (DB + Router), Frontend fehlt komplett
- ⏳ `Messages.tsx` - Nachrichten-Übersicht-Seite erstellen
- ⏳ `ChatWindow.tsx` - Chat-Interface-Komponente erstellen
- ⏳ `MessageIcon.tsx` - Message-Badge im Header
- ⏳ Real-time Updates (Polling oder WebSocket)
- ⏳ Unread-Counter
- ⏳ Message-Notifications
 - ⏳ Verkäufer-Namensdarstellung: Im Chat sollen aktive Verkäufer als `ShopName (Nickname)` angezeigt werden (Identitäts-Klarheit)

### 2. Notifications System (Priorität: HOCH) 🔔
**Status:** Backend fertig (DB + Router), Frontend fehlt komplett
- ⏳ `Notifications.tsx` - Benachrichtigungs-Seite erstellen
- ⏳ `NotificationBell.tsx` - Notification-Badge im Header
- ⏳ In-App Notification Center
- ⏳ Mark as Read/Unread
- ⏳ Notification-Grouping

### 3. OAuth Integration (Priorität: HOCH) 🔐
- ⏳ Google OAuth Setup
- ⏳ GitHub OAuth Setup
- ⏳ OAuth Callback-Handler erweitern
- ⏳ User-Profile mit OAuth-Daten synchronisieren
- ⏳ Multi-Provider Support (ein User, mehrere Login-Methoden)

### 2. Image Upload System (Priorität: HOCH)
- ⏳ Frontend: MultiImageUpload Component fertigstellen
- ⏳ Frontend: ImageUpload Component integrieren
- ⏳ Backend: Storage-Integration (R2/B2 oder Built-in)
- ⏳ Backend: Image-Optimierung (Resize, Compress)
- ⏳ Backend: Image-Validierung (Format, Größe, Content)
- ⏳ Frontend: Drag & Drop Support
- ⏳ Frontend: Image-Preview & Cropping
- ⏳ Frontend: Multiple Images per Listing

### 3. PayPal Integration vervollständigen (Priorität: MITTEL)
- ⏳ Sandbox Testing
- ⏳ Order Creation Flow
- ⏳ Payment Capture
- ⏳ Webhook Handler
- ⏳ Refund System
- ⏳ Transaction Status Updates
- ⏳ Email-Benachrichtigungen

### 4. Chat/Messaging System (Priorität: MITTEL)
- ✅ Backend komplett (messages Tabelle, chat Router, DB-Functions)
- ⏳ `Messages.tsx` - Frontend-Seite erstellen
- ⏳ `ChatWindow.tsx` - Chat-UI erstellen
- ⏳ Real-time Chat (WebSocket oder Polling)
- ⏳ `MessageIcon.tsx` - Header-Component
- ⏳ Typing-Indicators
- ⏳ File-Sharing in Chat
 - ⏳ Verkäufer-Identitätsanzeige: Darstellung `ShopName (Nickname)` für Seller bei Nachrichten

### 5. Notification System vervollständigen (Priorität: MITTEL)
- ✅ Backend komplett (notifications Tabelle, Router, DB-Functions)
- ⏳ `Notifications.tsx` - Frontend-Seite erstellen
- ⏳ `NotificationBell.tsx` - Header-Component
- ⏳ In-App Notification Center
- ⏳ Email-Benachrichtigungen
- ⏳ Push-Benachrichtigungen (optional)
- ⏳ Notification-Preferences
- ⏳ Mark as Read/Unread
- ⏳ Notification-Grouping

### 6. Review System erweitern (Priorität: NIEDRIG)
- ⏳ Review-Formular UI
- ⏳ Rating-Display auf Listings
- ⏳ Seller-Rating-Profile
- ⏳ Review-Moderation durch Admins
- ⏳ Helpful/Report Buttons

### 7. Search & Filter (Priorität: MITTEL)
- ⏳ Full-Text Search für Listings
- ⏳ Advanced Filters (Preis, Kategorie, Standort)
- ⏳ Sorting (Newest, Price, Rating)
- ⏳ Saved Searches
- ⏳ Search History

### 8. User Experience Verbesserungen (Priorität: NIEDRIG)
- ⏳ Skeleton Loaders
- ⏳ Infinite Scroll für Listen
- ⏳ Optimistic UI Updates
- ⏳ Error-Boundaries erweitern
- ⏳ Loading States standardisieren

### 9. Security & Compliance (Priorität: HOCH)
- ⏳ Rate Limiting implementieren
- ⏳ CSRF Protection
- ⏳ Input Sanitization erweitern
- ⏳ XSS Protection
- ⏳ SQL Injection Prevention (bereits durch Drizzle)
- ⏳ GDPR Compliance (Datenschutz)
- ⏳ Cookie Consent Banner

### 10. Testing (Priorität: MITTEL)
- ⏳ Unit Tests für kritische Funktionen
- ⏳ Integration Tests für API
- ⏳ E2E Tests für User-Flows
- ⏳ Performance Tests
- ⏳ Security Tests

### 11. Deployment & Production (Priorität: HOCH)
- ⏳ Production Docker Build optimieren
- ⏳ CI/CD Pipeline (GitHub Actions)
- ⏳ Environment-Variablen Management
- ⏳ Database Backup Strategy
- ⏳ Monitoring & Logging (Sentry, LogRocket)
- ⏳ CDN für Static Assets
- ⏳ SSL/HTTPS Setup

## 📊 Aktueller Status

### Was funktioniert:
- ✅ Komplette Platform-Basis (Backend + Frontend)
- ✅ Vollständiges Admin-System mit 7 Modulen
- ✅ User/Seller/Listing/Transaction Management
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Dev-Login & Testing-Tools
- ✅ Docker Development Environment
- ✅ Database Schema & Migrations

### Was noch fehlt:
- ⏳ OAuth (Google, GitHub)
- ⏳ Image Upload System
- ⏳ PayPal Payment Flow
- ⏳ Real-time Chat
- ⏳ Email-Benachrichtigungen
- ⏳ Production Deployment

### Nächste Schritte (Priorität):
1. **OAuth Integration** - Login-System produktionsreif machen
2. **Image Upload** - Listings mit Bildern ermöglichen
3. **PayPal Flow** - Bezahlsystem fertigstellen
4. **Security & Testing** - Production-ready machen

## 🔥 Heute abgeschlossen (Session-Highlight):

### Admin-System Implementation (4 Stunden)
- ✅ 7 vollständige Admin-Komponenten (3.200+ Zeilen Code)
- ✅ 25+ Admin-API-Endpoints
- ✅ 85+ Database-Funktionen
- ✅ Rollenbasierte Navigation
- ✅ Dev-Testing-Infrastructure
- ✅ TypeScript Compilation Fixes (25+ Fehler)
- ✅ Import-Path Corrections
- ✅ Live-Testing & Validation

**Zeitersparnis durch Backup-Discovery:** 95% (3-4 Wochen → 4 Stunden) 🎉

## 📝 Notizen

### Development URLs:
- **Main App:** http://localhost:3001/
- **Admin Dashboard:** http://localhost:3001/admin/dashboard
- **Admin Test Page:** http://localhost:3001/admin/test
- **Dev Login:** http://localhost:3001/api/dev-login?openId=admin@test.com&name=Test+Admin&admin=1
- **Health Check:** http://localhost:3001/healthz
- **Adminer (DB):** http://localhost:8080/

### Test Credentials:
- **Admin:** admin@test.com (auto-created, role: super_admin)
- **Dev User:** http://localhost:3001/api/dev-login

### Admin Module Paths:
- `/admin/dashboard` - Dashboard mit Stats
- `/admin/users` - User Management
- `/admin/transactions` - Transaktionen
- `/admin/listings` - Content-Moderation
- `/admin/settings` - System-Config
- `/admin/stats` - Analytics
- `/admin/security` - IP-Blocking & Logs
- `/admin/test` - Testing Page

---

*Letzte Aktualisierung: 15. November 2025*
*Status: Phase 1 & 2 abgeschlossen, Phase 3 in Planung*