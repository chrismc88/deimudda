# Security Audit Report - deimudda

**Datum:** 16. November 2025  
**Status:** Kritische Sicherheitslücken identifiziert  
**Priorität:** HOCH - Vor Production-Deployment beheben

---

## 🚨 Executive Summary

Die Codebase weist mehrere kritische Sicherheitslücken auf. IP-Blocking ist **nicht funktionsfähig** (nur Platzhalter-Code), Security-Middleware **komplett fehlend**, und mehrere Auth-Risiken existieren. Vor einem Production-Deployment müssen mindestens die KRITISCH- und HOCH-Priorität-Items behoben werden.

**Positiv:** SQL Injection geschützt (Drizzle ORM), Role-Based Access Control funktioniert, HTTP-Only Cookies für Sessions.

---

## ❌ KRITISCH (Sofort beheben)

### 1. IP-Blocking: Nicht funktionsfähig

**Status:** Schema ✅ | DB-Funktionen ❌ | Admin-UI ✅ | Middleware ❌

#### Problem:
- Datenbank-Tabellen existieren: `blockedIPs`, `loginAttempts`
- Admin-UI vollständig implementiert (`AdminSecurity.tsx` - 450 Zeilen)
- tRPC Endpoints vorhanden (`getBlockedIPs`, `blockIP`, `unblockIP`)
- **ABER:** Alle DB-Funktionen sind Platzhalter (Zeilen 1847-1866 in `server/db.ts`)

```typescript
// server/db.ts (Zeile 1847-1866)
export async function getIPsWithMostAttempts(limit: number = 10) {
  console.log("[Database] getIPsWithMostAttempts not yet implemented (loginAttempts table)");
  return [];
}

export async function getBlockedIPs() {
  console.log("[Database] getBlockedIPs not yet implemented (blockedIPs table)");
  return [];
}

export async function blockIP(ipAddress: string, reason: string, adminId: number) {
  console.log("[Database] blockIP not yet implemented (blockedIPs table)", { ipAddress, reason, adminId });
  return { success: false };
}

export async function unblockIP(ipAddress: string) {
  console.log("[Database] unblockIP not yet implemented (blockedIPs table)", ipAddress);
  return { success: false };
}
```

#### Impact:
- ❌ Admin kann keine IPs blockieren (Button funktionslos)
- ❌ Keine Protection gegen Brute-Force-Angriffe via IP-Block
- ❌ Login-Attempts werden nicht geloggt (Tabelle leer: 0 Einträge)
- ❌ Keine Auto-Block-Funktionalität nach X fehlgeschlagenen Logins

#### Lösung:
1. **DB-Funktionen implementieren:**
   - `blockIP()`: INSERT INTO blockedIPs mit IP, reason, adminId, blockedAt
   - `unblockIP()`: UPDATE blockedIPs SET unblockedAt = NOW(), unblockedBy = adminId
   - `getBlockedIPs()`: SELECT * FROM blockedIPs WHERE unblockedAt IS NULL
   - `getIPsWithMostAttempts()`: SELECT ip, COUNT(*) FROM loginAttempts WHERE success=false GROUP BY ip ORDER BY count DESC LIMIT ?

2. **IP-Blocking Middleware:**
   - Express-Middleware VOR allen Routes
   - Extrahiere Client-IP (X-Forwarded-For beachten)
   - Query blockedIPs table
   - Bei Match: HTTP 403 Response

3. **Login-Attempt-Tracking:**
   - Bei jedem Login-Versuch (OAuth + Dev-Login): INSERT INTO loginAttempts
   - Felder: ip, userId (wenn bekannt), userAgent, success (boolean), timestamp
   - Auto-Block nach configurable threshold (z.B. 5 fails in 15min)

---

### 2. Security-Middleware Stack fehlt komplett

**Status:** ❌ Keine Security-Pakete installiert oder konfiguriert

#### Problem:
```typescript
// server/_core/index.ts (Zeile 43-45)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// ... KEINE weiteren Security-Middlewares
```

**Fehlende Pakete (nicht in package.json):**
- ❌ `helmet` (Security Headers)
- ❌ `cors` (Cross-Origin Configuration)
- ❌ `express-rate-limit` (Rate Limiting)
- ❌ `express-mongo-sanitize` (Input Sanitization, optional)

#### Impact:
- ❌ Keine CSP (Content Security Policy) → XSS-Anfälligkeit
- ❌ Keine HSTS (HTTP Strict Transport Security) → MITM-Risiko
- ❌ Keine X-Frame-Options → Clickjacking-Risiko
- ❌ Kein Rate Limiting → Brute-Force-Angriffe möglich
- ❌ Keine CORS-Kontrolle → Potenzielle Cross-Origin Issues

#### Lösung:

```typescript
// 1. Pakete installieren
pnpm install helmet cors express-rate-limit

// 2. In server/_core/index.ts einbinden:
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Nach app.use(express.json()) hinzufügen:

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// CORS (wenn nötig, aktuell same-origin)
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? "https://deimudda.de" 
    : "http://localhost:3001",
  credentials: true,
}));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // 100 Requests pro IP
  message: "Too many requests from this IP",
});
app.use(limiter);

// Login-spezifisches Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 Login-Versuche
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true,
});
app.use("/api/dev-login", loginLimiter);
app.use("/api/dev/admin-login", loginLimiter);
```

---

## ⚠️ HOCH (Vor Production beheben)

### 3. Dev-Login Endpoints aktiv

**Problem:**
- `/api/dev-login` (GET mit Query-Params)
- `/api/dev/admin-login` (POST mit Email → Admin-Zugang)
- Gesteuert durch `DEV_LOGIN_ENABLED` (default: `"true"` in Development)

**Code:**
```typescript
// server/_core/index.ts (Zeile 56-58)
const devLoginEnabled = !["0", "false", "no"].includes(
  String(process.env.DEV_LOGIN_ENABLED || "true").toLowerCase()
);
```

**Risiko:**
- ❌ Falls `.env` in Production kein `DEV_LOGIN_ENABLED=false` hat, bleiben Endpoints aktiv
- ❌ Bypass der gesamten OAuth-Authentifizierung
- ❌ Admin-Login ohne Password möglich

**Lösung:**

```typescript
// Option 1: Stricter Default (empfohlen)
const devLoginEnabled = process.env.NODE_ENV === "development" 
  && ["1", "true", "yes"].includes(String(process.env.DEV_LOGIN_ENABLED || "false").toLowerCase());

// Option 2: Explizit Production-Check
if (process.env.NODE_ENV === "production" && devLoginEnabled) {
  throw new Error("FATAL: Dev login endpoints cannot be enabled in production!");
}
```

**Zusätzlich:**
- ✅ Env-Variable in `.env.example` dokumentieren: `DEV_LOGIN_ENABLED=false # MUST be false in production`
- ✅ Startup-Warning erweitern: "⚠️ SECURITY WARNING: Dev login active in production!"

---

### 4. Session-Management Risiken

**Problem:**

```typescript
// server/_core/index.ts (Zeile 103, 129)
res.cookie(COOKIE_NAME, token, {
  ...cookieOptions,
  maxAge: ONE_YEAR_MS, // 31,536,000,000 ms = 365 Tage
});
```

**ONE_YEAR_MS** = 1 Jahr Session-Laufzeit

**Risiken:**
- ⚠️ Zu lange Session-Dauer erhöht Risiko bei Token-Diebstahl
- ⚠️ Kein Refresh-Token-Mechanismus → User muss sich 1x pro Jahr einloggen
- ⚠️ Keine Möglichkeit, Sessions remote zu invalidieren (außer Cookie-Secret ändern)

**Empfehlung:**

```typescript
// 1. Session-Expiry verkürzen
const SESSION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 Tage
const REFRESH_TOKEN_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000; // 90 Tage

// 2. Refresh-Token Pattern (optional, aber empfohlen):
// - Access Token: 14 Tage (in HTTP-Only Cookie)
// - Refresh Token: 90 Tage (separate Datenbank-Tabelle)
// - Endpoint /api/refresh zur Token-Erneuerung
// - Bei Access Token Expiry: Auto-Refresh im Client
```

**Balance:**
- 7-14 Tage: Gute Balance zwischen Security und UX
- 30-90 Tage Refresh: Keine häufigen Logins bei aktiven Users
- > 1 Jahr: Zu riskant für Production

---

## 🟡 MITTEL (Nach Critical/High)

### 5. Admin-Funktionen ohne DB-Tabellen-Zugriff

**Problem:**
Drei Admin-Funktionen schreiben nur in `users` table, nicht in dedizierte Tabellen:

```typescript
// server/db.ts
export async function warnUser(userId, adminId, reason, message) {
  // ✅ UPDATE users SET status='warned', warningCount++
  // ❌ TODO: INSERT into warnings table
  // ❌ TODO: Create notification
}

export async function suspendUser(userId, adminId, reason, days) {
  // ✅ UPDATE users SET status='suspended', suspendedUntil
  // ❌ TODO: INSERT into suspensions table
  // ❌ TODO: Create notification
}

export async function banUser(userId, adminId, reason) {
  // ✅ UPDATE users SET status='banned', bannedAt, bannedReason
  // ❌ TODO: INSERT into bans table
  // ❌ TODO: Create notification
}
```

**Tabellen existieren:**
- `warnings` (0 Einträge)
- `suspensions` (0 Einträge)
- `bans` (0 Einträge)

**Impact:**
- ⚠️ Keine Historie von Warnings/Suspensions/Bans
- ⚠️ Admin-UI `AdminSecurity.tsx` zeigt keine Logs (getSecurityLogs gibt Mock-Daten zurück)
- ⚠️ Keine Benachrichtigungen an betroffene User

**Lösung:**

```typescript
export async function warnUser(userId: number, adminId: number, reason: string, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // 1. Update user
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const newWarningCount = (user[0].warningCount || 0) + 1;
    await db.update(users)
      .set({ status: 'warned', warningCount: newWarningCount })
      .where(eq(users.id, userId));

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

  } catch (error) {
    console.error("[Database] Failed to warn user:", error);
    throw error;
  }
}
```

Analog für `suspendUser()` und `banUser()`.

---

### 6. Body Size Limit zu hoch

**Problem:**
```typescript
// server/_core/index.ts
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
```

**Risiko:**
- ⚠️ 50MB JSON-Payload kann Server überschwemmen (DoS)
- ⚠️ Keine Notwendigkeit für so große Payloads (Bilder via S3, nicht Body)

**Empfehlung:**

```typescript
// Standard-Requests: 1-2MB ausreichend
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Falls größere Uploads nötig (z.B. Listing-Images):
// → Separater Upload-Endpoint mit Multer + Streaming to S3
// → NICHT via JSON Body
```

---

### 7. CSRF Protection fehlt

**Problem:**
- ❌ Keine CSRF-Token-Validierung für state-changing Operations

**Risiko:**
- ⚠️ Cross-Site Request Forgery möglich
- ⚠️ Betrifft besonders: Create/Update/Delete Mutations (Listings, Offers, Admin-Actions)

**Lösung:**

**Option 1: Double Submit Cookie (einfach)**
```typescript
import { doubleCsrf } from "csrf-csrf";

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => ENV.cookieSecret,
  cookieName: "__Host-psifi.x-csrf-token",
  cookieOptions: { sameSite: "lax", secure: ENV.isProduction },
});

app.use(doubleCsrfProtection);
```

**Option 2: SameSite Cookie + Origin Check (empfohlen für moderne Clients)**
- Session-Cookie bereits `SameSite=Lax` (prüfen in `getSessionCookieOptions`)
- Origin-Header-Check in tRPC Context:

```typescript
// server/_core/context.ts
export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Origin Check für Mutations
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3001",
    "https://deimudda.de",
  ];
  
  if (req.method === "POST" && !allowedOrigins.includes(origin || "")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Invalid origin" });
  }
  
  // ... rest
}
```

---

### 8. IP-Extraktion für Proxy/Load-Balancer

**Problem:**
- ❌ Keine Middleware zur Client-IP-Extraktion
- ❌ `req.ip` gibt bei Reverse-Proxy (Nginx/Cloudflare) oft Proxy-IP zurück

**Lösung:**

```typescript
// server/_core/middleware/getClientIP.ts
export function getClientIP(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// In context.ts verwenden:
export async function createContext({ req, res }: CreateExpressContextOptions) {
  const clientIP = getClientIP(req);
  
  // Check if IP is blocked
  const isBlocked = await db.isIPBlocked(clientIP);
  if (isBlocked) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Your IP address has been blocked" 
    });
  }
  
  return {
    req,
    res,
    clientIP, // ← Verfügbar in allen Procedures
    user: await getUserFromSession(req),
  };
}
```

---

### 9. Security-Logging (getSecurityLogs)

**Problem:**
```typescript
// server/routers.ts (Zeile 777-798)
getSecurityLogs: adminProcedure.query(async () => {
  // Mock data for now - you can implement real security logs later
  return [
    { id: 1, type: "ip_block", ipAddress: "192.168.1.100", ... },
    { id: 2, type: "failed_login", ipAddress: "10.0.0.50", ... },
  ];
}),
```

**Impact:**
- ⚠️ Admin-UI zeigt nur Fake-Daten
- ⚠️ Keine echten Security-Events geloggt

**Lösung:**

```typescript
// server/db.ts
export async function getSecurityLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Union von verschiedenen Security-Events
  const ipBlockEvents = await db.select({
    id: blockedIPs.id,
    type: sql`'ip_block'`,
    ipAddress: blockedIPs.ip,
    details: blockedIPs.reason,
    timestamp: blockedIPs.blockedAt,
    adminId: blockedIPs.blockedBy,
  }).from(blockedIPs).orderBy(desc(blockedIPs.blockedAt)).limit(limit);

  const failedLogins = await db.select({
    id: loginAttempts.id,
    type: sql`'failed_login'`,
    ipAddress: loginAttempts.ip,
    details: sql`CONCAT('User: ', COALESCE(users.name, 'Unknown'))`,
    timestamp: loginAttempts.timestamp,
    adminId: sql`NULL`,
  }).from(loginAttempts)
    .leftJoin(users, eq(loginAttempts.userId, users.id))
    .where(eq(loginAttempts.success, false))
    .orderBy(desc(loginAttempts.timestamp))
    .limit(limit);

  // Merge + Sort by timestamp
  return [...ipBlockEvents, ...failedLogins]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
```

---

### 10. Error-Handling in Production

**Problem:**
- ⚠️ Stack Traces werden in Development an Client gesendet
- ⚠️ Keine Prüfung, ob Production-Mode korrekte Error-Masking hat

**Lösung:**

```typescript
// server/_core/trpc.ts
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // In Production: Keine Stack Traces
        stack: process.env.NODE_ENV === 'production' 
          ? undefined 
          : error.stack,
      },
    };
  },
});
```

---

## ✅ Was funktioniert gut (Positive Aspekte)

### 1. SQL Injection geschützt
- ✅ Drizzle ORM mit Parameterized Queries
- ✅ Keine String-Konkatenation in SQL
- ✅ Type-safe DB Access

### 2. Role-Based Access Control
- ✅ tRPC Middleware: `requireUser`, `requireAdmin`, `requireSuperAdmin`
- ✅ Konsistent in allen sensiblen Endpoints verwendet
- ✅ Frontend prüft User-Role für UI-Anzeige

### 3. Session-Management
- ✅ HTTP-Only Cookies (nicht via JS zugänglich → XSS-Schutz)
- ✅ Secure-Flag in Production (HTTPS-only)
- ✅ SameSite-Attribut (CSRF-Mitigation)

### 4. Input-Validierung
- ✅ Zod-Schemas an allen tRPC-Endpunkten
- ✅ Type-safe Input-Validation
- ✅ Listing-Felder (Strain, Price, Quantity) validiert

---

## 📋 Priorisierte Implementierungs-Roadmap

### Phase 1: KRITISCH (1-2 Tage, vor Beta-Deployment)

1. **IP-Blocking komplett implementieren** (4-6h)
   - [ ] DB-Funktionen: blockIP, unblockIP, getBlockedIPs, getIPsWithMostAttempts
   - [ ] IP-Blocking Middleware (vor allen Routes)
   - [ ] Login-Attempt-Tracking bei OAuth + Dev-Login
   - [ ] Auto-Block nach X failed attempts (systemSettings: `max_failed_login_attempts`)

2. **Security-Middleware Stack** (2-3h)
   - [ ] `pnpm install helmet cors express-rate-limit`
   - [ ] Helmet-Konfiguration (CSP, HSTS)
   - [ ] CORS (same-origin oder allowed domains)
   - [ ] Global Rate Limiting (100 req/15min)
   - [ ] Login Rate Limiting (5 attempts/15min)

3. **Dev-Login Hardening** (30min)
   - [ ] Default auf `false` ändern (nur explizit aktivierbar)
   - [ ] Production-Check: Throw Error wenn enabled
   - [ ] `.env.example` aktualisieren

### Phase 2: HOCH (1 Tag)

4. **Session-Management verbessern** (2-3h)
   - [ ] Session-Expiry auf 14 Tage reduzieren
   - [ ] Optional: Refresh-Token-Schema + Endpoint
   - [ ] Session-Invalidierung bei Logout

5. **Admin-Tabellen-Integration** (2-3h)
   - [ ] warnUser: INSERT into warnings + notification
   - [ ] suspendUser: INSERT into suspensions + notification
   - [ ] banUser: INSERT into bans + notification
   - [ ] getSecurityLogs: Echte Daten aus DB

### Phase 3: MITTEL (1-2 Tage, vor Production)

6. **Body Size Limits** (15min)
   - [ ] JSON/URL-encoded auf 2MB reduzieren
   - [ ] Dokumentation für Image-Uploads (S3, nicht Body)

7. **CSRF Protection** (1-2h)
   - [ ] SameSite-Cookie prüfen (bereits vorhanden?)
   - [ ] Origin-Check in tRPC Context
   - [ ] Optional: Double Submit Cookie

8. **IP-Extraktion Middleware** (1h)
   - [ ] X-Forwarded-For Parsing
   - [ ] In Context verfügbar machen
   - [ ] Bei IP-Block-Check verwenden

9. **Error-Handling** (30min)
   - [ ] Production Error Formatter (keine Stack Traces)
   - [ ] Logging-System (Winston/Pino) für Server-Errors

10. **Testing** (3-4h)
    - [ ] Security-Tests: IP-Blocking, Rate Limiting
    - [ ] E2E: Admin-Actions (Warn/Suspend/Ban)
    - [ ] Penetration-Test (optional, externe Tools)

---

## 🔍 Testing Checklist (nach Implementierung)

### IP-Blocking
- [ ] Admin kann IP blockieren (DB-Eintrag existiert)
- [ ] Blockierte IP erhält HTTP 403
- [ ] Admin kann IP wieder freigeben
- [ ] Login-Attempts werden geloggt
- [ ] Auto-Block nach 5 fehlgeschlagenen Logins

### Rate Limiting
- [ ] 101 Requests in 15min → HTTP 429 (Too Many Requests)
- [ ] 6 Login-Versuche in 15min → HTTP 429
- [ ] Verschiedene IPs haben separate Limits

### Dev-Login
- [ ] In Production: Endpoints returnen HTTP 404 oder disabled
- [ ] In Development: Endpoints funktionieren nur mit Flag

### Sessions
- [ ] Session läuft nach 14 Tagen ab
- [ ] Logout invalidiert Session
- [ ] Secure + HttpOnly + SameSite Flags gesetzt

### Admin-Actions
- [ ] Warning: Eintrag in `warnings` table + Notification
- [ ] Suspension: Eintrag in `suspensions` table + Notification
- [ ] Ban: Eintrag in `bans` table + Notification
- [ ] Security Logs: Echte Events werden angezeigt

---

## 📚 Referenzen & Best Practices

### OWASP Top 10 (2021) Coverage
- ✅ A01 - Broken Access Control: **Role-based Protected**
- ⚠️ A02 - Cryptographic Failures: **Session-Cookies ok, Passwörter N/A (OAuth)**
- ✅ A03 - Injection: **SQL Injection protected (Drizzle ORM)**
- ⚠️ A04 - Insecure Design: **IP-Blocking fehlt, Rate Limiting fehlt**
- ⚠️ A05 - Security Misconfiguration: **Dev-Login, Keine Security Headers**
- ⚠️ A06 - Vulnerable Components: **Dependencies regelmäßig prüfen (pnpm audit)**
- ⚠️ A07 - Identification/Auth Failures: **Session zu lang, kein Rate Limiting**
- ✅ A08 - Software/Data Integrity: **Type-safe mit TypeScript + Zod**
- ⚠️ A09 - Security Logging Failures: **Mock-Daten in getSecurityLogs**
- ⚠️ A10 - Server-Side Request Forgery: **Nicht relevant (keine externe Requests vom Server)**

**Score:** 3/10 vollständig ✅, 6/10 teilweise ⚠️, 1/10 nicht relevant

### Recommended Reading
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Docs](https://helmetjs.github.io/)
- [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)

---

## 🏁 Zusammenfassung

**Aktueller Zustand:**
- 🔴 KRITISCH: IP-Blocking nicht funktionsfähig
- 🔴 KRITISCH: Security-Middleware fehlt komplett
- 🟡 HOCH: Auth/Session-Risiken (Dev-Login, lange Expiry)
- 🟢 POSITIV: SQL Injection geschützt, RBAC funktioniert

**Nächste Schritte:**
1. Phase 1 (KRITISCH) implementieren → 1-2 Tage
2. Phase 2 (HOCH) umsetzen → 1 Tag
3. Testing durchführen → 3-4h
4. **Dann:** Beta-Deployment möglich
5. Phase 3 (MITTEL) vor Production-Launch → 1-2 Tage

**ETA bis Production-Ready:** ~5-7 Arbeitstage (Security Hardening)

---

**Report erstellt von:** GitHub Copilot (AI Security Audit)  
**Letzte Aktualisierung:** 16. November 2025, 02:15 CET
