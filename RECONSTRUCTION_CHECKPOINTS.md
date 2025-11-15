# deimudda - Phase Checkpoints

**Zweck:** Validierungs-Checklisten für Phase-Abschluss  
**Format:** Pro Phase → Checkpoints → Validierungs-Kriterien  
**Update-Frequenz:** Nach jeder Phase

---

## 🎯 Phase 1: DATENBANK & BACKEND - Checkpoint

**Geplanter Abschluss:** 2025-11-28  
**Status:** 🟡 Phase 1.1 COMPLETE ✅ | Phase 1.2 In Progress

### Checkpoint 1.1: Datenbank-Schema
**Status:** ✅ COMPLETE (14.11.2025)

#### Validierungs-Kriterien:

- [x] `warnings` Tabelle existiert und hat korrekte Struktur
  ```sql
  ✅ SELECT * FROM warnings LIMIT 1;
  -- Felder: id, userId, adminId, reason, message, active, createdAt, removedAt, removedBy
  ```

- [x] `suspensions` Tabelle existiert
  ```sql
  ✅ SELECT * FROM suspensions LIMIT 1;
  -- Felder: id, userId, adminId, reason, suspendedAt, suspendedUntil, active, liftedAt, liftedBy
  ```

- [x] `bans` Tabelle existiert
  ```sql
  ✅ SELECT * FROM bans LIMIT 1;
  -- Felder: id, userId, adminId, reason, bannedAt, unbannedAt, unbannedBy
  ```

- [x] `reports` Tabelle existiert
  ```sql
  ✅ SELECT * FROM reports LIMIT 1;
  -- Felder: id, reporterId, reportedType, reportedId, reason, message, status, reviewedBy, reviewedAt, resolution, createdAt
  ```

- [x] `adminLogs` Tabelle existiert
  ```sql
  ✅ SELECT * FROM adminLogs LIMIT 1;
  -- Felder: id, adminId, action, targetType, targetId, details, createdAt
  ```

- [x] `loginAttempts` Tabelle existiert
  ```sql
  ✅ SELECT * FROM loginAttempts LIMIT 1;
  -- Felder: id, ip, userId, userAgent, success, timestamp
  ```

- [x] `blockedIPs` Tabelle existiert
  ```sql
  ✅ SELECT * FROM blockedIPs LIMIT 1;
  -- Felder: id, ip, reason, blockedBy, blockedAt, unblockedAt, unblockedBy
  ```

- [x] `systemSettings` Tabelle existiert
  ```sql
  ✅ SELECT COUNT(*) FROM systemSettings;
  -- Hat 17 Einträge ✓
  ```

- [x] `messages` Tabelle existiert (oder Update falls vorhanden)
  ```sql
  ✅ SELECT * FROM messages LIMIT 1;
  -- Felder: id, senderId, receiverId, listingId, content, isRead, createdAt
  ```

- [x] `notifications` Tabelle existiert (oder Update falls vorhanden)
  ```sql
  ✅ SELECT * FROM notifications LIMIT 1;
  -- Felder: id, userId, type, title, message, link, isRead, createdAt
  ```

- [x] Alle Indizes erstellt
  ```sql
  SHOW INDEXES FROM users;
  SHOW INDEXES FROM warnings;
  SHOW INDEXES FROM systemSettings;
  -- Sollten Indizes auf Lookup-Feldern haben
  ```

- [ ] Foreign Keys definiert (optional aber empfohlen)
  ```sql
  SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_NAME='warnings' AND COLUMN_NAME='userId';
  ```

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 1.2: systemSettings Initialisierung
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] Seed-Script erstellt: `server/_core/seedSettings.ts`
- [ ] Seed-Script kann ausgeführt werden:
  ```bash
  pnpm exec tsx server/_core/seedSettings.ts
  ```

- [ ] 17 Settings werden korrekt initialisiert:
  ```sql
  SELECT key, value, category FROM systemSettings ORDER BY category;
  ```

- [ ] Gebühren-Settings korrekt:
  ```sql
  SELECT value FROM systemSettings WHERE key IN 
  ('platform_fee_fixed', 'paypal_fee_percentage', 'paypal_fee_fixed');
  -- Erwartet: 0.42, 2.49, 0.49
  ```

- [ ] Limit-Settings korrekt:
  ```sql
  SELECT value FROM systemSettings WHERE key LIKE '%max_%' OR key LIKE '%min_%';
  ```

- [ ] Security-Settings korrekt:
  ```sql
  SELECT value FROM systemSettings WHERE category = 'security';
  ```

- [ ] Settings können gelesen werden via tRPC:
  ```typescript
  const settings = await trpc.system.getSystemSettings.query();
  console.log(Object.keys(settings).length); // Sollte 17 sein
  ```

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 1.3: tRPC Router-Struktur
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] Alle 5 neuen Router skelettiert:
  ```typescript
  // server/routers.ts sollte enthalten:
  - systemRouter
  - adminRouter
  - messageRouter
  - notificationRouter
  - offer Router (erweitert)
  ```

- [ ] Router werden korrekt importiert und registriert:
  ```typescript
  export const appRouter = router({
    system: systemRouter,
    admin: adminRouter,
    message: messageRouter,
    notification: notificationRouter,
    // ... existing routers
  });
  ```

- [ ] Alle Procedures haben korrekte Procedure-Typen:
  ```typescript
  // system Router beispiel:
  getMaintenanceStatus: publicProcedure.query(...),
  toggleMaintenanceMode: superAdminProcedure.mutation(...),
  ```

- [ ] Input-Validierung mit Zod vorhanden:
  ```typescript
  warnUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      reason: z.string(),
      // ...
    }))
    .mutation(...)
  ```

- [ ] Procedures können aufgerufen werden (Test-Anfrage):
  ```typescript
  // Frontend Test:
  const settings = await trpc.system.getSystemSettings.query();
  // Sollte nicht crashen
  ```

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 1.4: DB-Operationen
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] `server/db.ts` hat Funktionen für alle neuen Tabellen:
  ```typescript
  // Admin Operations
  warnUser(userId, adminId, reason, message): Promise<void>
  suspendUser(userId, adminId, reason, suspendedUntil): Promise<void>
  banUser(userId, adminId, reason): Promise<void>
  unbanUser(userId, adminId): Promise<void>
  removeWarning(warningId, adminId): Promise<void>
  // ... weitere Funktionen
  ```

- [ ] Security Operations vorhanden:
  ```typescript
  recordLoginAttempt(ip, userId, userAgent, success): Promise<void>
  getLoginAttemptsByIP(ip, windowMinutes): Promise<LoginAttempt[]>
  isIPBlocked(ip): Promise<boolean>
  blockIP(ip, reason, blockedBy): Promise<void>
  ```

- [ ] System Settings Operations vorhanden:
  ```typescript
  getSystemSettings(): Promise<Record<string, string>>
  updateSystemSetting(key, value, updatedBy): Promise<void>
  ```

- [ ] Message Operations vorhanden:
  ```typescript
  sendMessage(senderId, receiverId, content, listingId?): Promise<Message>
  getConversations(userId): Promise<Conversation[]>
  getConversation(userId, otherUserId): Promise<Message[]>
  markAsRead(messageId, userId): Promise<void>
  ```

- [ ] Notification Operations vorhanden:
  ```typescript
  createNotification(userId, type, title, message, link?): Promise<void>
  getNotifications(userId): Promise<Notification[]>
  markAsRead(notificationId, userId): Promise<void>
  getUnreadCount(userId): Promise<number>
  ```

- [ ] DB-Operationen können ohne Fehler ausgeführt werden:
  ```typescript
  // Test:
  const user = await db.getUserById(1);
  const settings = await db.getSystemSettings();
  // Sollte nicht crashen
  ```

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

## 🎯 Phase 2: ADMIN-SYSTEM - Checkpoint

**Geplanter Abschluss:** 2025-12-12  
**Status:** ⏳ Not Started

### Checkpoint 2.1: Admin Router Complete
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] **User Management** (9 Procedures)
  - [ ] `getAllUsers` query funktioniert
  - [ ] `warnUser` mutation funktioniert
  - [ ] `suspendUser` mutation funktioniert
  - [ ] `banUser` mutation funktioniert
  - [ ] `unbanUser` mutation funktioniert
  - [ ] `unsuspendUser` mutation funktioniert
  - [ ] `removeWarning` mutation funktioniert (Super Admin)
  - [ ] `getUserWarnings` query funktioniert
  - [ ] Rollen-Check funktioniert (nur admin+ können aufrufen)

- [ ] **Listing Management** (3 Procedures)
  - [ ] `getAllListings` query funktioniert
  - [ ] `deleteListing` mutation funktioniert
  - [ ] `deactivateListing` mutation funktioniert

- [ ] **Transaction Management** (2 Procedures)
  - [ ] `getAllTransactions` query funktioniert
  - [ ] `getTransactionStats` query funktioniert

- [ ] **Report Management** (2 Procedures)
  - [ ] `getAllReports` query funktioniert
  - [ ] `updateReportStatus` mutation funktioniert

- [ ] **Admin Management** (3 Procedures - Super Admin)
  - [ ] `promoteToAdmin` mutation funktioniert
  - [ ] `demoteFromAdmin` mutation funktioniert
  - [ ] `getAllAdmins` query funktioniert

- [ ] **Security Management** (4 Procedures - Super Admin)
  - [ ] `getSuspiciousIPs` query funktioniert
  - [ ] `getBlockedIPs` query funktioniert
  - [ ] `blockIP` mutation funktioniert
  - [ ] `unblockIP` mutation funktioniert

- [ ] **Logs & Stats** (2 Procedures)
  - [ ] `getAdminLogs` query funktioniert
  - [ ] `getStats` query funktioniert

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 2.2: Admin-Seiten Implementiert
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] Alle 10 Seiten erstellt:
  - [ ] `AdminDashboard.tsx` (/admin)
  - [ ] `AdminUsers.tsx` (/admin/users)
  - [ ] `AdminListings.tsx` (/admin/listings)
  - [ ] `AdminTransactions.tsx` (/admin/transactions)
  - [ ] `AdminReports.tsx` (/admin/reports)
  - [ ] `AdminStats.tsx` (/admin/stats)
  - [ ] `AdminLogs.tsx` (/admin/logs)
  - [ ] `AdminManage.tsx` (/admin/manage - Super Admin)
  - [ ] `AdminSettings.tsx` (/admin/settings - Super Admin)
  - [ ] `AdminSecurity.tsx` (/admin/security - Super Admin)

- [ ] Routing funktioniert:
  ```bash
  localhost:3000/admin              # ✅ Admin Dashboard laden
  localhost:3000/admin/users        # ✅ Users-Seite laden
  localhost:3000/admin/settings     # ✅ Settings-Seite laden (Super Admin)
  ```

- [ ] Rollen-Gating funktioniert:
  - [ ] Non-Admin kann /admin nicht aufrufen (redirect zu /)
  - [ ] Admin kann /admin/settings nicht aufrufen (nur Super Admin)
  - [ ] Super Admin hat Zugriff auf alle Seiten

- [ ] Daten werden korrekt angezeigt:
  - [ ] AdminUsers zeigt Nutzer-Liste
  - [ ] AdminListings zeigt Listings
  - [ ] AdminTransactions zeigt Transaktionen
  - [ ] AdminSettings zeigt 17 System-Einstellungen

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 2.3: Sicherheits-Features
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] Rate-Limiting funktioniert:
  - [ ] Max. 10 Login-Versuche pro IP in 15 Min
  - [ ] Max. 5 Login-Versuche pro User in 15 Min
  - [ ] 30 Min Lockout nach Überschreitung

- [ ] IP-Blocking funktioniert:
  - [ ] Blockierte IPs können nicht einloggen
  - [ ] Admin kann IP blockieren via API
  - [ ] Admin kann IP entsperren

- [ ] Wartungsmodus funktioniert:
  - [ ] Super Admin kann toggleMaintenanceMode aufrufen
  - [ ] Normal User sieht /maintenance Seite
  - [ ] Super Admin hat vollen Zugriff
  - [ ] Cache wird aktualisiert (< 35 Sekunden)

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

## 🎯 Phase 3: NACHRICHTEN & BENACHRICHTIGUNGEN - Checkpoint

**Geplanter Abschluss:** 2025-12-19  
**Status:** ⏳ Not Started

### Checkpoint 3.1: Message System Complete
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] Message Router implementiert (5 Procedures)
  - [ ] `send` mutation funktioniert
  - [ ] `getConversations` query funktioniert
  - [ ] `getConversation` query funktioniert
  - [ ] `markAsRead` mutation funktioniert
  - [ ] `getUnreadCount` query funktioniert

- [ ] Messages.tsx Seite funktioniert
  - [ ] Konversations-Liste wird angezeigt
  - [ ] Ungelesen-Badge funktioniert
  - [ ] Suchfunktion funktioniert
  - [ ] Link zu ChatWindow funktioniert

- [ ] ChatWindow.tsx funktioniert
  - [ ] Nachrichten werden angezeigt
  - [ ] Neue Nachrichten können gesendet werden
  - [ ] Echtzeit-Updates funktionieren (Polling)
  - [ ] Kontakt-Info des anderen Users ist sichtbar

- [ ] MessageIcon im Header funktioniert
  - [ ] Ungelesen-Badge wird angezeigt
  - [ ] Dropdown-Übersicht funktioniert
  - [ ] Link zu Messages-Seite funktioniert

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 3.2: Notification System Complete
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] Notification Router implementiert (4 Procedures)
  - [ ] `getAll` query funktioniert
  - [ ] `markAsRead` mutation funktioniert
  - [ ] `markAllAsRead` mutation funktioniert
  - [ ] `getUnreadCount` query funktioniert

- [ ] Notifications.tsx Seite funktioniert
  - [ ] Benachrichtigungs-Liste wird angezeigt
  - [ ] Ungelesen-Filter funktioniert
  - [ ] Mark-as-read funktioniert
  - [ ] Links zur Quelle funktionieren

- [ ] NotificationBell im Header funktioniert
  - [ ] Ungelesen-Badge wird angezeigt
  - [ ] Pulsing-Animation bei neuen Benachrichtigungen
  - [ ] Dropdown-Übersicht funktioniert
  - [ ] Link zu Notifications-Seite funktioniert

- [ ] Auto-Benachrichtigungen funktionieren:
  - [ ] Neue Nachricht → Benachrichtigung
  - [ ] Preisvorschlag → Benachrichtigung
  - [ ] Transaktion abgeschlossen → Benachrichtigung
  - [ ] Bewertung erhalten → Benachrichtigung
  - [ ] Verwarnung → Benachrichtigung
  - [ ] Admin-Aktion → Benachrichtigung

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

## 🎯 Phase 4: TESTS & DEPLOYMENT - Checkpoint

**Geplanter Abschluss:** 2025-12-26  
**Status:** ⏳ Not Started

### Checkpoint 4.1: End-to-End Tests
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] **Flow 1: Registrierung & Profil**
  - [ ] User A registriert sich ✅
  - [ ] User A aktiviert Verkäufer-Modus ✅
  - [ ] User A bearbeitet Profil ✅
  - [ ] User A kann sein Profil anschauen ✅

- [ ] **Flow 2: Listing-Lifecycle**
  - [ ] User A erstellt Listing mit Bildern ✅
  - [ ] Listing ist in Browse-Liste sichtbar ✅
  - [ ] User A kann Listing bearbeiten ✅
  - [ ] User A kann Listing löschen ✅

- [ ] **Flow 3: Kauf-Prozess**
  - [ ] User B findet Listing ✅
  - [ ] User B macht Preisvorschlag (falls aktiviert) ✅
  - [ ] User A lehnt/akzeptiert Angebot ✅
  - [ ] User B führt Checkout durch (PayPal Test) ✅
  - [ ] Transaktion wird erstellt ✅

- [ ] **Flow 4: Messaging**
  - [ ] User A sendet Nachricht an User B ✅
  - [ ] User B erhält Benachrichtigung ✅
  - [ ] User B antwortet ✅
  - [ ] Nachrichten sind in History sichtbar ✅

- [ ] **Flow 5: Bewertungen**
  - [ ] Nach Transaktion: Bewertung-Button anzeigen ✅
  - [ ] User B schreibt Bewertung (1-5 Sterne) ✅
  - [ ] Rating wird aktualisiert in Seller-Profil ✅
  - [ ] Andere User sehen Bewertung ✅

- [ ] **Flow 6: Admin-Funktionen**
  - [ ] Admin kann User verwarnen ✅
  - [ ] User sieht Verwarnung in Profil ✅
  - [ ] Nach 3 Verwarnungen: Auto-Suspend ✅
  - [ ] Admin kann Ban/Unban durchführen ✅
  - [ ] Admin kann Listing löschen ✅
  - [ ] Admin kann Transaktion einsehen ✅

- [ ] **Flow 7: Sicherheit**
  - [ ] Wartungsmodus aktivieren → Normal User gesperrt ✅
  - [ ] Super Admin hat vollen Zugriff ✅
  - [ ] Rate-Limiting auf Login getestet ✅
  - [ ] IP-Blocking funktioniert ✅

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

### Checkpoint 4.2: Build & Deployment
**Status:** ⏳ Not Started

#### Validierungs-Kriterien:

- [ ] `pnpm build` erfolgreich
  ```bash
  pnpm build
  # Sollte ohne Fehler abgeschlossen werden
  ```

- [ ] `pnpm start` funktioniert
  ```bash
  pnpm start
  # Server sollte starten auf Port 3000
  ```

- [ ] Datenbankmigrationen funktionieren
  ```bash
  pnpm db:push
  # Alle neuen Tabellen sollten existieren
  ```

- [ ] System-Einstellungen initialisiert
  ```bash
  pnpm exec tsx server/_core/seedSettings.ts
  # 17 Einstellungen sollten vorhanden sein
  ```

- [ ] Umgebungsvariablen gesetzt
  - [ ] DATABASE_URL
  - [ ] OAUTH_CLIENT_ID
  - [ ] OAUTH_CLIENT_SECRET
  - [ ] PAYPAL_CLIENT_ID
  - [ ] PAYPAL_CLIENT_SECRET
  - [ ] SESSION_SECRET

- [ ] Health-Check erfolgreich
  ```bash
  curl http://localhost:3000/healthz
  # Sollte OK zurückgeben
  ```

- [ ] Live-Test durchgeführt
  - [ ] Website lädt (http://localhost:3000)
  - [ ] Login funktioniert
  - [ ] Dashboard funktioniert
  - [ ] Admin-Panel funktioniert

**Checkpoint Status:** ⏳ Pending  
**Sign-Off:** [Name]  
**Datum:** YYYY-MM-DD

---

## 📋 Sign-Off Template

**Phase:** Phase X  
**Checkpoint:** X.X  
**Status:** ✅ PASSED / ⚠️ PARTIAL / ❌ FAILED

**Sign-Off:**
- Geprüft von: [Name]
- Datum: YYYY-MM-DD
- Notizen: [Zusätzliche Anmerkungen]

**Next Steps:**
- [ ] Phase abschließen
- [ ] Zum nächsten Checkpoint übergehen
- [ ] Issues dokumentieren (wenn vorhanden)

---

## 🔗 Links zu anderen Dokumenten

- **Roadmap:** [RECONSTRUCTION_ROADMAP.md](RECONSTRUCTION_ROADMAP.md)
- **Progress:** [RECONSTRUCTION_PROGRESS.md](RECONSTRUCTION_PROGRESS.md)
- **Decisions:** [RECONSTRUCTION_DECISIONS.md](RECONSTRUCTION_DECISIONS.md)
- **Issues:** [RECONSTRUCTION_ISSUES.md](RECONSTRUCTION_ISSUES.md)

---

**Letzte Aktualisierung:** 14. November 2025, 16:00 UTC

