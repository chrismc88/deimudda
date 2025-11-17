# Code Inkohärenzen Report - deimudda

**Datum:** 16. November 2025  
**Zweck:** Dokumentation von Unstimmigkeiten zwischen Schema, Code und Funktionalität

---

## 📊 Übersicht

Neben den Sicherheitslücken wurden mehrere **Code-Inkohärenzen** identifiziert - Stellen, wo:
- Schema existiert, aber nicht genutzt wird
- Funktionen implementiert sind, aber incomplete TODOs haben
- Frontend UI vorhanden ist, aber Backend-Funktionen fehlen
- Mock-Daten statt echte DB-Queries verwendet werden

---

## 🔴 KRITISCH - Nicht funktionale Features

### 1. IP-Blocking System

**Schema:** ✅ Existiert (Tabellen: `blockedIPs`, `loginAttempts`)  
**Backend:** ❌ Platzhalter (4 Funktionen returnen Mock-Daten)  
**Frontend:** ✅ Admin-UI komplett (`AdminSecurity.tsx`, 450 Zeilen)  
**Router:** ✅ tRPC Endpoints vorhanden  

**Inkohärenz:**
- Admin sieht UI mit "Block IP" Button
- Button ruft `trpc.admin.blockIP.useMutation()` auf
- Mutation ruft `db.blockIP()` auf → **returnt { success: false }**
- Datenbank-Eintrag wird NIE erstellt

**Impact:**
- Admin denkt, Feature funktioniert
- Keine echte IP-Blockierung aktiv
- Tabelle `blockedIPs` bleibt leer (0 Einträge)

**Code-Stellen:**
```typescript
// server/db.ts (Zeile 1847-1866)
export async function getIPsWithMostAttempts(limit: number = 10) {
  console.log("[Database] getIPsWithMostAttempts not yet implemented (loginAttempts table)");
  return []; // ❌ Sollte echte Query sein
}

export async function getBlockedIPs() {
  console.log("[Database] getBlockedIPs not yet implemented (blockedIPs table)");
  return []; // ❌ Sollte echte Query sein
}

export async function blockIP(ipAddress: string, reason: string, adminId: number) {
  console.log("[Database] blockIP not yet implemented (blockedIPs table)", { ipAddress, reason, adminId });
  return { success: false }; // ❌ Sollte INSERT durchführen
}

export async function unblockIP(ipAddress: string) {
  console.log("[Database] unblockIP not yet implemented (blockedIPs table)", ipAddress);
  return { success: false }; // ❌ Sollte UPDATE durchführen
}
```

**Lösung:** Siehe SECURITY_AUDIT_REPORT.md, Abschnitt "IP-Blocking"

---

### 2. Security Logs (Admin UI)

**Schema:** ✅ Ableitbar aus `blockedIPs`, `loginAttempts`, `adminLogs`  
**Backend:** ❌ Mock-Daten  
**Frontend:** ✅ UI vorhanden (`AdminSecurity.tsx`)  
**Router:** ✅ Endpoint `getSecurityLogs` existiert  

**Inkohärenz:**
```typescript
// server/routers.ts (Zeile 777-798)
getSecurityLogs: adminProcedure.query(async () => {
  // Mock data for now - you can implement real security logs later
  return [
    {
      id: 1,
      type: "ip_block" as const,
      ipAddress: "192.168.1.100",
      details: "Suspicious login attempts detected",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      adminId: 1,
      adminName: "Admin User",
    },
    {
      id: 2,
      type: "failed_login" as const,
      ipAddress: "10.0.0.50",
      details: "Multiple failed login attempts",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]; // ❌ Hardcoded Mock-Daten
});
```

**Impact:**
- Admin sieht immer die gleichen 2 Fake-Events
- Echte Security-Events werden nicht angezeigt
- Keine Audit-Trail für Admin-Aktionen

**Erwartetes Verhalten:**
- Query `blockedIPs` für IP-Block-Events
- Query `loginAttempts` WHERE success=false für Failed-Login-Events
- Join mit `users` table für Namen
- Sortiert nach Timestamp, neueste zuerst

---

## 🟡 HOCH - Incomplete Implementations

### 3. Admin User-Actions (Warn/Suspend/Ban)

**Schema:** ✅ Tabellen existieren (`warnings`, `suspensions`, `bans`)  
**Backend:** ⚠️ Teilweise implementiert  
**Frontend:** ✅ UI vorhanden (`AdminUsers.tsx`)  
**Tabellen-Status:** ❌ Leer (0 Einträge in allen 3 Tabellen)  

**Inkohärenz:**
Funktionen schreiben nur in `users` table, nicht in dedizierte Tabellen:

```typescript
// server/db.ts (Zeile 836-875)
export async function warnUser(userId: number, adminId: number, reason: string, message: string) {
  // ✅ UPDATE users SET status='warned', warningCount++
  await db.update(users)
    .set({ status: 'warned', warningCount: newWarningCount })
    .where(eq(users.id, userId));
  
  // ✅ Log admin action
  await createAdminLog({...});
  
  // ❌ TODO: Insert into warnings table when schema is complete
  // ❌ TODO: Create notification when notifications system is complete
}
```

**Analog:** `suspendUser()` und `banUser()` haben gleiche TODOs (Zeilen 903-904, 938-939)

**Impact:**
- User erhält Status-Change (warned/suspended/banned) ✅
- ABER: Keine Historie in `warnings`/`suspensions`/`bans` tables ❌
- ABER: Keine Notification an betroffenen User ❌
- Admin kann nicht sehen, warum/wann User gewarnt wurde (außer in adminLogs)

**Erwartetes Verhalten:**
```typescript
export async function warnUser(userId: number, adminId: number, reason: string, message: string) {
  // 1. Update user (bereits vorhanden)
  await db.update(users).set({ status: 'warned', warningCount: newWarningCount });
  
  // 2. INSERT into warnings table
  await db.insert(warnings).values({
    userId,
    adminId,
    reason,
    message,
    active: true,
    createdAt: new Date(),
  });
  
  // 3. Create notification
  await createNotification({
    userId,
    type: 'warning',
    title: 'You have received a warning',
    message: `Reason: ${reason}. ${message}`,
    link: '/profile',
  });
  
  // 4. Admin log (bereits vorhanden)
  await createAdminLog({...});
}
```

---

### 4. Login-Attempt-Tracking fehlt

**Schema:** ✅ Tabelle `loginAttempts` existiert  
**Backend:** ❌ Keine Logging-Logik  
**Frontend:** N/A  
**Tabellen-Status:** ❌ Leer (0 Einträge)  

**Inkohärenz:**
- Tabelle wurde erstellt (Migration 0000)
- Wird in `getIPsWithMostAttempts()` referenziert (console.log Platzhalter)
- ABER: Nirgendwo wird INSERT durchgeführt

**Fehlende Stellen:**
```typescript
// 1. In server/_core/index.ts bei Dev-Login (Zeile 64-107)
app.get("/api/dev-login", async (req, res) => {
  // ... user upsert ...
  
  // ❌ FEHLT: INSERT INTO loginAttempts
  // await db.insert(loginAttempts).values({
  //   ip: getClientIP(req),
  //   userId: user.id,
  //   userAgent: req.headers['user-agent'],
  //   success: true,
  //   timestamp: new Date(),
  // });
  
  res.redirect(302, "/");
});

// 2. Bei OAuth-Callback (falls implementiert)
// 3. Bei Admin-Login (Zeile 109-140)
```

**Impact:**
- `getIPsWithMostAttempts()` returnt immer leeres Array
- Keine Daten für Auto-Block nach X failed attempts
- Keine Security-Logs über Failed-Logins

---

### 5. Dev-Login Flag nicht in ENV-File

**Schema:** N/A  
**Backend:** ✅ Flag implementiert (`DEV_LOGIN_ENABLED`)  
**Frontend:** N/A  
**ENV:** ❌ Nicht dokumentiert  

**Inkohärenz:**
```typescript
// server/_core/index.ts (Zeile 56-58)
const devLoginEnabled = !["0", "false", "no"].includes(
  String(process.env.DEV_LOGIN_ENABLED || "true").toLowerCase()
);
```

**Problem:**
- Default: `"true"` (aktiviert)
- Kein Eintrag in `.env.example`
- Kein Hinweis in README.md
- Risiko: In Production vergessen zu deaktivieren

**Erwartetes Verhalten:**
```bash
# .env.example
DEV_LOGIN_ENABLED=false # MUST be false in production! Enables /api/dev-login endpoints
```

```typescript
// Stricter Default:
const devLoginEnabled = process.env.NODE_ENV === "development" 
  && ["1", "true", "yes"].includes(String(process.env.DEV_LOGIN_ENABLED || "false").toLowerCase());
```

---

## 🟢 NIEDRIG - Documentation/Consistency Issues

### 6. Notification-System incomplete

**Schema:** ✅ Tabelle `notifications` existiert  
**Backend:** ✅ Funktionen vorhanden (`createNotification`, `getMyNotifications`, etc.)  
**Frontend:** ✅ UI vorhanden (`Notifications.tsx`, `NotificationBell.tsx`)  
**Usage:** ⚠️ Teilweise genutzt  

**Inkohärenz:**
Notifications werden erstellt für:
- ✅ Neue Offers (`createOffer` → Benachrichtigung an Verkäufer)
- ✅ Abgelehnte Offers (`rejectOffer` → Benachrichtigung an Käufer)
- ✅ Counter-Offers (in `counterOffer` und `respondToCounter`)

ABER nicht für:
- ❌ Warn/Suspend/Ban (siehe Punkt 3 - TODOs vorhanden)
- ❌ Neue Messages (Chat-System hat keine Benachrichtigungen)
- ❌ Accepted Offers (nur Transaktion wird erstellt)

**Erwartetes Verhalten:**
```typescript
// In acceptOffer (server/db.ts)
await createNotification({
  userId: offer.buyerId,
  type: 'offer',
  title: 'Offer Accepted!',
  message: `Your offer for ${listing.strain} was accepted`,
  link: `/transactions`,
});

// In sendMessage (Chat-System)
await createNotification({
  userId: receiverId,
  type: 'message',
  title: 'New Message',
  message: `From ${senderName}: ${truncate(content, 50)}`,
  link: `/messages/${conversationId}`,
});
```

---

### 7. System Settings incomplete

**Schema:** ✅ Tabelle `systemSettings` existiert  
**Backend:** ✅ Getter/Setter vorhanden  
**Frontend:** ✅ Verwendet in mehreren Components  
**Migrations:** ⚠️ Teilweise  

**Inkohärenz:**
Migrations erstellt für:
- ✅ `platform_fee_fixed`, `paypal_fee_percentage`, `paypal_fee_fixed` (Migration 0011)
- ✅ `maintenance_mode`, `max_offers`, `min_offer_amount`, etc. (Migration 0012)
- ✅ `offer_expiration_days` (Migration 0010)

ABER nicht für Security-Settings:
- ❌ `max_failed_login_attempts` (für Auto-Block)
- ❌ `ip_block_duration_hours` (temporäre Blocks)
- ❌ `rate_limit_window_ms` (konfigurierbar)
- ❌ `rate_limit_max_requests` (konfigurierbar)

**Erwartete Migration:**
```sql
-- drizzle/0013_security_settings.sql
INSERT INTO systemSettings (`key`, `value`, description) VALUES
  ('max_failed_login_attempts', '5', 'Number of failed login attempts before IP auto-block'),
  ('ip_block_duration_hours', '24', 'Duration in hours for temporary IP blocks (0 = permanent)'),
  ('rate_limit_window_ms', '900000', 'Rate limit window in milliseconds (default: 15min)'),
  ('rate_limit_max_requests', '100', 'Maximum requests per window per IP');
```

---

### 8. AdminLogs vs. Security Logs

**Schema:** ✅ Tabelle `adminLogs` existiert  
**Backend:** ✅ `createAdminLog` und `getAdminLogs` vorhanden  
**Frontend:** ✅ UI vorhanden (`AdminLogs.tsx`)  
**Status:** ⚠️ Verwirrende Namensgebung  

**Inkohärenz:**
- `adminLogs` table loggt **Admin-Aktionen** (Warn/Ban/Delete/etc.)
- `AdminSecurity.tsx` zeigt **Security-Events** (IP-Blocks, Failed-Logins)
- Zwei verschiedene Konzepte, aber ähnliche Namen

**Problem:**
- `getAdminLogs()` ≠ `getSecurityLogs()`
- Admin-UI hat beides (AdminLogs.tsx + AdminSecurity.tsx)
- Unklar, was wohin gehört

**Klarstellung:**
```typescript
// adminLogs: Actions performed BY admins
type AdminLog = {
  adminId: number;
  action: 'warn_user' | 'ban_user' | 'delete_listing' | ...;
  targetType: 'user' | 'listing' | 'offer';
  targetId: number;
  details: string; // JSON
};

// securityLogs: Security-relevant events (separate Konzept)
type SecurityLog = {
  type: 'ip_block' | 'ip_unblock' | 'failed_login' | 'suspicious_activity';
  ipAddress: string;
  details: string;
  timestamp: Date;
  adminId?: number; // Optional (nur bei Admin-Aktionen)
};
```

**Lösung:** Dokumentation in Code-Kommentaren + README

---

### 9. Public Procedures ohne Rate Limiting

**Schema:** N/A  
**Backend:** ⚠️ Viele `publicProcedure` Endpoints  
**Frontend:** ✅ Verwendet in Components  
**Security:** ❌ Kein Rate Limiting  

**Inkohärenz:**
Mehrere kritische Endpoints sind `publicProcedure` (kein Login nötig):
- `listing.getActive` (Browse-Seite)
- `listing.getById` (Listing-Detail)
- `seller.getProfileById` (Verkäufer-Shop)
- `review.getBySellerId` (Reviews)
- `admin.createReport` (**kritisch!**)
- `admin.getSystemSetting` (System-Einstellungen)

**Problem:**
- Kein Auth-Check → Jeder kann zugreifen
- Kein Rate Limiting → Potenzielle DoS-Angriffe
- `createReport` ist PUBLIC → Spam-Reports möglich

**Erwartetes Verhalten:**
```typescript
// Option 1: createReport sollte protectedProcedure sein
createReport: protectedProcedure // ← Nur eingeloggte User
  .input(z.object({...}))
  .mutation(async ({ ctx, input }) => {
    // ctx.user ist garantiert vorhanden
    await db.createReport(ctx.user.id, input);
  });

// Option 2: Rate Limiting pro Endpoint
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 5, // 5 Reports pro Stunde
});
app.use("/api/trpc/admin.createReport", reportLimiter);
```

**Weitere betroffene Endpoints:**
- `getSystemSetting` → könnte gecacht werden (Client-seitig)
- `getActive` → Rate Limiting empfohlen (vermeidet Scraping)

---

### 10. Fehlende Tests für kritische Funktionen

**Schema:** N/A  
**Backend:** ✅ `offer.test.ts` existiert (10 Tests)  
**Frontend:** ❌ Keine Tests  
**Coverage:** ⚠️ Unvollständig  

**Inkohärenz:**
- `offer.test.ts` testet Offer-Lifecycle ✅
- ABER: Keine Tests für:
  - ❌ IP-Blocking Funktionen (blockIP, unblockIP)
  - ❌ Admin-User-Actions (warnUser, suspendUser, banUser)
  - ❌ Login-Attempt-Tracking
  - ❌ Session-Management
  - ❌ Rate Limiting
  - ❌ Notifications-System

**Erwartete Test-Dateien:**
```
server/
  auth.test.ts         // Session-Management, Dev-Login
  admin.test.ts        // warnUser, suspendUser, banUser
  security.test.ts     // IP-Blocking, Login-Attempts
  notifications.test.ts // createNotification, markAsRead
```

**Beispiel:**
```typescript
// server/security.test.ts
describe("IP Blocking", () => {
  it("should block IP and return success", async () => {
    const result = await db.blockIP("192.168.1.100", "Spam", 1);
    expect(result.success).toBe(true);
    
    const blocked = await db.getBlockedIPs();
    expect(blocked).toContainEqual(expect.objectContaining({
      ip: "192.168.1.100",
      reason: "Spam",
    }));
  });
  
  it("should prevent access from blocked IP", async () => {
    await db.blockIP("10.0.0.1", "Test", 1);
    
    const isBlocked = await db.isIPBlocked("10.0.0.1");
    expect(isBlocked).toBe(true);
  });
});
```

---

## 📊 Statistik der Inkohärenzen

| Kategorie | Anzahl | Priorität |
|-----------|--------|-----------|
| Nicht funktionale Features | 2 | 🔴 KRITISCH |
| Incomplete Implementations | 3 | 🟡 HOCH |
| Documentation/Consistency | 5 | 🟢 NIEDRIG |
| **GESAMT** | **10** | |

### Nach Schema-Status:

| Status | Beschreibung | Anzahl |
|--------|--------------|--------|
| ✅ Schema vorhanden, Code fehlt | Tabellen existieren, aber keine/falsche Nutzung | 4 |
| ⚠️ Code vorhanden, incomplete | Funktionen teilweise implementiert (TODOs) | 3 |
| ❌ Komplett fehlend | Kein Code für bestehende Features | 2 |
| 📚 Documentation-Gap | Code funktioniert, aber unklar/undokumentiert | 1 |

---

## 🔧 Empfohlene Actions

### Sofort (vor Beta-Deployment):
1. **IP-Blocking komplettieren** (siehe SECURITY_AUDIT_REPORT.md)
2. **Security Logs implementieren** (echte DB-Queries statt Mock)
3. **Login-Attempt-Tracking aktivieren** (INSERT bei jedem Login)

### Vor Production:
4. **Admin-Actions komplettieren** (INSERT in warnings/suspensions/bans + Notifications)
5. **Dev-Login Flag dokumentieren** (.env.example + README)
6. **Rate Limiting für Public Endpoints** (besonders createReport)

### Nice-to-have:
7. **Notifications erweitern** (Messages, Accepted Offers)
8. **Security Settings Migration** (max_failed_login_attempts, etc.)
9. **Test-Coverage erhöhen** (Security, Admin, Notifications)
10. **Code-Dokumentation** (AdminLogs vs. SecurityLogs Unterschied)

---

## 📝 Lessons Learned

### Pattern für zukünftige Features:

1. **Schema-First ✅**
   - Migration erstellen
   - Tabelle in Drizzle Schema definieren
   - Types exportieren

2. **Backend-Implementation ✅**
   - DB-Funktionen komplett implementieren (keine Platzhalter!)
   - tRPC Router mit korrekten Procedures
   - Tests schreiben

3. **Frontend-Integration ✅**
   - UI-Components erstellen
   - tRPC Hooks verwenden
   - Error-Handling

4. **Documentation ✅**
   - Code-Kommentare
   - README aktualisieren
   - .env.example pflegen

**Anti-Pattern vermeiden:**
- ❌ UI bauen, bevor Backend funktioniert
- ❌ Platzhalter-Code in main branch committen
- ❌ TODOs ohne Issue-Tracking
- ❌ Mock-Daten in Production-Code

---

**Report erstellt von:** GitHub Copilot (AI Code Audit)  
**Letzte Aktualisierung:** 16. November 2025, 02:20 CET
