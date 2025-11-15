# deimudda - Entscheidungs-Log

**Zweck:** Dokumentation aller technischen & strukturellen Entscheidungen  
**Format:** Entscheidung → Begründung → Alternativen → Status  
**Update-Frequenz:** Bei jeder Entscheidung

---

## 📋 Entscheidungs-Matrix

### DECISION-001: Tracking-System für Rekonstruktion
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ✅ ENTSCHIEDEN

**Entscheidung:**
Alle Progress-Dateien als Markdown im Projekt-Root speichern und als Kontext verfügbar halten.

**Struktur:**
1. `RECONSTRUCTION_ROADMAP.md` - Master-Fahrplan (4 Phasen)
2. `RECONSTRUCTION_PROGRESS.md` - Tages/Sprint-Logs (chronologisch)
3. `RECONSTRUCTION_DECISIONS.md` - Entscheidungs-Log (diese Datei)
4. `RECONSTRUCTION_ISSUES.md` - Issue-Tracker (Problem-Lösung)
5. `RECONSTRUCTION_CHECKPOINTS.md` - Phase-Validierung

**Begründung:**
- Vollständige Transparenz und Nachverfolgbarkeit
- Automatisiert updatebar durch AI/Entwickler
- Alle Details als Kontext für nächste Sessions verfügbar
- Kontinuierliche Optimierung des Prozesses möglich

**Alternativen betrachtet:**
- ❌ Google Docs: Keine automatische Integration, schwerer zu versionieren
- ❌ Jira/Linear: Overhead für Projekt dieser Größe
- ❌ GitHub Issues: Zu fragmentiert für Gesamt-Roadmap
- ✅ Markdown im Repo: Beste Option für dieses Projekt

**Impact:** Hoch - strukturiert die gesamte Rekonstruktion  
**Abhängigkeiten:** Keine  
**Follow-up:** Zu prüfen nach Phase 1

---

### DECISION-002: Phase-Sequenzierung
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ✅ ENTSCHIEDEN

**Entscheidung:**
Strikte linearer Phasen-Ablauf: Phase 1 → 2 → 3 → 4 (keine Parallelisierung)

**Begründung:**
- Phase 1 (DB) ist Dependency für Phase 2 (Admin-Routers verwenden DB)
- Phase 2 (Admin) ist Dependency für Phase 4 (End-to-End Tests)
- Klare Meilensteine und Validierungspunkte
- Verhindert "Tangled Dependencies"

**Alternative betrachtet:**
- ❌ Parallele Phasen: Könnte zu Konflikten führen, schwerer zu testen
- ✅ Linear-Sequenz: Klare Dependencies und Meilensteine

**Timeline:**
- Phase 1: 2 Wochen (14.11 - 28.11)
- Phase 2: 2 Wochen (28.11 - 12.12)
- Phase 3: 1 Woche (12.12 - 19.12)
- Phase 4: 1-2 Wochen (19.12 - 26.12)
- **Total: 6-8 Wochen bis Live**

**Impact:** Hoch - definiert gesamtes Projekt-Tempo  
**Abhängigkeiten:** Keine  
**Follow-up:** Nach Phase 1 Review durchführen

---

### DECISION-003: Datenbank-First Ansatz
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ✅ ENTSCHIEDEN

**Entscheidung:**
Alle fehlenden Datenbank-Tabellen ZUERST implementieren (Phase 1.1) vor tRPC-Routers (Phase 1.2)

**Begründung:**
- DB-Schema ist Fundament für alles andere
- tRPC-Routers brauchen DB-Operationen
- Clear separation of concerns (Daten ≠ API)
- Ermöglicht einfachere DB-Validierung

**Reihenfolge Phase 1:**
1. Alle 10 Tabellen in `drizzle/schema.ts` hinzufügen
2. `pnpm db:push` ausführen (Migrationen)
3. Seed-Script für `systemSettings` (17 Einstellungen)
4. tRPC-Router strukturieren
5. DB-Operationen in `server/db.ts` implementieren

**Zu erstellende Tabellen (Priorität):**
1. `systemSettings` - Blocker für viele Features
2. `warnings`, `suspensions`, `bans` - Admin-Core
3. `adminLogs` - Security & Audit
4. `loginAttempts`, `blockedIPs` - Security
5. `reports` - Community-Reports
6. `messages`, `notifications` - User-Features

**Impact:** Hoch - strukturiert Phase 1  
**Abhängigkeiten:** Keine  
**Follow-up:** Nach systemSettings initialisierung

---

### DECISION-004: tRPC Router-Struktur
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ✅ ENTSCHIEDEN

**Entscheidung:**
5 neue Routers im Projekt implementieren:

```typescript
export const appRouter = router({
  system: systemRouter,      // ← NEU
  auth: authRouter,          // ← existiert
  profile: profileRouter,     // ← existiert
  seller: sellerRouter,       // ← existiert
  listing: listingRouter,     // ← existiert
  transaction: transactionRouter, // ← existiert
  review: reviewRouter,       // ← existiert
  message: messageRouter,     // ← NEU
  notification: notificationRouter, // ← NEU
  offer: offerRouter,         // ← existiert (erweitern)
  admin: adminRouter,         // ← NEU (komplett)
});
```

**Begründung:**
- Klare Separation nach Funktionalität
- Modular und wartbar
- Middleware-Reuse (publicProcedure, protectedProcedure, adminProcedure, superAdminProcedure)
- Entspricht Dokumentation genau

**Router-Struktur (detailliert):**

| Router | Procedures | Status | Aufwand |
|--------|-----------|--------|---------|
| system | 4 | NEU | 8h |
| admin | 20+ | NEU | 40h |
| message | 5 | NEU | 16h |
| notification | 4 | NEU | 12h |
| offer | 6 | ERWEITERN | 8h |

**Impact:** Hoch - strukturiert gesamte API  
**Abhängigkeiten:** Phase 1.1 (DB-Tabellen)  
**Follow-up:** Nach DB-Implementierung

---

### DECISION-005: Admin-Frontend 10-Seiten-Struktur
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ✅ ENTSCHIEDEN

**Entscheidung:**
10 separate Admin-Komponenten für volle Modularität:

```
client/src/pages/admin/
├── AdminDashboard.tsx     (Übersicht)
├── AdminUsers.tsx         (Nutzer-Verwaltung)
├── AdminListings.tsx      (Listing-Moderation)
├── AdminTransactions.tsx  (Transaktionen)
├── AdminReports.tsx       (Report-Bearbeitung)
├── AdminStats.tsx         (Statistiken & Charts)
├── AdminLogs.tsx          (Audit-Trail)
├── AdminManage.tsx        (Super Admin: Admin-Verwaltung)
├── AdminSettings.tsx      (Super Admin: System-Einstellungen)
└── AdminSecurity.tsx      (Super Admin: IP-Blocking)
```

**Begründung:**
- Jede Seite separate Verantwortung
- Einfacher zu testen
- Klare Route-Struktur (`/admin/*`)
- Komponenten-Wiederverwendung

**Alternative betrachtet:**
- ❌ Single 50KB AdminPage.tsx: Zu groß, schwer zu warten
- ✅ 10 separate Seiten: Modular, testbar, wartbar

**Super Admin vs Admin:**
- **Admin-Seiten (7):** AdminDashboard, AdminUsers, AdminListings, AdminTransactions, AdminReports, AdminStats, AdminLogs
- **Super Admin Only (3):** AdminManage, AdminSettings, AdminSecurity

**Impact:** Mittel - strukturiert Frontend-Phase  
**Abhängigkeiten:** Phase 2 (Admin-Router)  
**Follow-up:** Nach Admin-Router-Implementierung

---

### DECISION-006: End-to-End Test Strategy
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ✅ ENTSCHIEDEN

**Entscheidung:**
7 kritische User-Flows vollständig testen (Phase 4):

1. Registrierung & Profil
2. Listing-Lifecycle
3. Kauf-Prozess (mit PayPal)
4. Messaging
5. Bewertungssystem
6. Admin-Funktionen
7. Sicherheit & Wartungsmodus

**Begründung:**
- Deckt 80% aller Kritikalität ab
- Manuell testbar (kleine Liste)
- End-to-End = höchstes Vertrauen

**Test-Methodik:**
- 2 Test-User-Accounts (TestA, TestB)
- Checklisten pro Flow
- Screenshots/Videos dokumentieren
- Fehler → `RECONSTRUCTION_ISSUES.md`

**Impact:** Hoch - Quality Assurance  
**Abhängigkeiten:** Phase 3 abgeschlossen  
**Follow-up:** Nach ersten E2E-Tests

---

### DECISION-007: Gebühren-Struktur Initialisierung
**Datum:** 14. November 2025  
**Initiator:** AI Assistant  
**Status:** ⏳ PENDING (Phase 1.1)

**Entscheidung:**
17 System-Einstellungen via Seed-Script initialisieren:

```typescript
const defaultSettings = [
  { key: 'platform_fee_fixed', value: '0.42', category: 'fees' },
  { key: 'paypal_fee_percentage', value: '2.49', category: 'fees' },
  { key: 'paypal_fee_fixed', value: '0.49', category: 'fees' },
  { key: 'max_listing_images', value: '10', category: 'limits' },
  { key: 'max_listing_price', value: '1000', category: 'limits' },
  { key: 'min_listing_price', value: '0.50', category: 'limits' },
  { key: 'max_active_listings_per_user', value: '50', category: 'limits' },
  { key: 'image_max_size_mb', value: '5', category: 'limits' },
  { key: 'min_age_requirement', value: '18', category: 'general' },
  { key: 'review_window_days', value: '90', category: 'general' },
  { key: 'warning_threshold', value: '3', category: 'security' },
  { key: 'suspension_max_days', value: '365', category: 'security' },
  { key: 'registration_enabled', value: 'true', category: 'general' },
  { key: 'maintenance_mode', value: 'false', category: 'general' },
  { key: 'max_login_attempts_per_ip', value: '10', category: 'security' },
  { key: 'max_login_attempts_per_user', value: '5', category: 'security' },
  { key: 'login_lockout_duration_minutes', value: '30', category: 'security' },
];
```

**Begründung:**
- Alle Werte dynamisch konfigurierbar
- Basis-Werte basieren auf Original-Dokumentation
- Super Admin kann später alle ändern

**Seed-Methodik:**
```bash
# Script erstellen: server/_core/seedSettings.ts
# Ausführen: pnpm exec tsx server/_core/seedSettings.ts
# Validieren: SELECT * FROM systemSettings;
```

**Impact:** Mittel - benötigt für Admin-Settings-Page  
**Abhängigkeiten:** systemSettings Tabelle erstellt  
**Follow-up:** Nach systemSettings Seed

---

## 📊 Entscheidungs-Status

| Decision | Datum | Status | Impact | Follow-up Needed |
|----------|-------|--------|--------|-----------------|
| DECISION-001 | 14.11 | ✅ Entschieden | Hoch | Nach Phase 1 |
| DECISION-002 | 14.11 | ✅ Entschieden | Hoch | Nach Phase 1 |
| DECISION-003 | 14.11 | ✅ Entschieden | Hoch | Nach DB-Init |
| DECISION-004 | 14.11 | ✅ Entschieden | Hoch | Nach Phase 1.2 |
| DECISION-005 | 14.11 | ✅ Entschieden | Mittel | Nach Phase 2 |
| DECISION-006 | 14.11 | ✅ Entschieden | Hoch | Nach Phase 4 |
| DECISION-007 | 14.11 | ⏳ Pending | Mittel | Phase 1.1 |

---

## 🔗 Links zu anderen Dokumenten

- **Roadmap:** [RECONSTRUCTION_ROADMAP.md](RECONSTRUCTION_ROADMAP.md)
- **Progress:** [RECONSTRUCTION_PROGRESS.md](RECONSTRUCTION_PROGRESS.md)
- **Issues:** [RECONSTRUCTION_ISSUES.md](RECONSTRUCTION_ISSUES.md)
- **Checkpoints:** [RECONSTRUCTION_CHECKPOINTS.md](RECONSTRUCTION_CHECKPOINTS.md)

---

**Letzte Aktualisierung:** 14. November 2025, 15:45 UTC  
**Nächste Entscheidung:** Nach Phase 1.1 Completion
