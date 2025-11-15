# deimudda - Issue & Blocker Tracker

**Zweck:** Zentrales Tracking von bekannten Issues, Blockern, und Problemen  
**Format:** Issue-ID → Beschreibung → Impact → Status → Lösung  
**Update-Frequenz:** Bei jedem neuen Problem

---

## 📊 Issue-Status-Übersicht

| ID | Titel | Priority | Status | Affected Phase |
|----|-------|----------|--------|-----------------|
| ISSUE-001 | [Template] | Low | ⏳ Open | - |

---

## 🎯 Aktive Issues (Priorisiert)

*(Momentan keine aktiven Issues - Projekt startet frisch)*

---

## ✅ Gelöste Issues (History)

*(Wird gefüllt wenn Issues auftreten und gelöst werden)*

---

## 📋 Issue-Template

```markdown
### ISSUE-XXX: Titel
**Datum Entdeckt:** YYYY-MM-DD  
**Reporter:** [Name]  
**Priority:** High / Medium / Low  
**Status:** Open / In-Progress / Blocked / Resolved  
**Affected Phase:** Phase X.X

**Beschreibung:**
Detaillierte Beschreibung des Problems.

**Reproduction Steps (falls applicable):**
1. Schritt 1
2. Schritt 2
3. Schritt 3

**Impact:**
- Beschreibung der Auswirkungen
- Betroffene Features
- User-Impact

**Root Cause:**
[Analysierte Ursache, falls bekannt]

**Proposed Solution:**
[Lösungsansatz]

**Workaround (falls vorhanden):**
[Temporäre Lösung]

**Resolution:**
[Wie das Problem gelöst wurde]

**Gelöst am:** YYYY-MM-DD  
**Resolved By:** [Name]
```

---

## 🚨 Blocker-Matrix

Aktuell keine Blocker - Projekt bereit für Phase 1 Start

---

## 📈 Issue-Trend

```
       High Priority
         |
    5   |
         |
    4   |
         |     Medium Priority
    3   |    /
         |   /
    2   |  /
         | /
    1   |/_____ Low Priority
         |___________________
         Datum
```

---

## 🔍 Known Limitations (aus Dokumentation)

Diese sind **keine** neuen Issues, sondern dokumentierte Einschränkungen der Originalversion:

### Bekannte Einschränkungen (Nicht zu fixen)

1. **File Storage** - Aktuell lokal, Migration zu S3 geplant (nicht in Scope Phase 1-4)
2. **Email-Benachrichtigungen** - Nur In-App (nicht in Scope)
3. **Auktions-System** - Implementiert aber nicht vollständig getestet (validieren in Phase 4)
4. **Preisvorschlag-System** - Implementiert aber nicht vollständig getestet (validieren in Phase 4)
5. **Watchlist/Favoriten** - Nicht implementiert (nicht in Scope)
6. **Versandverfolgung** - Nicht implementiert (nicht in Scope)

---

## 🔗 Links zu anderen Dokumenten

- **Roadmap:** [RECONSTRUCTION_ROADMAP.md](RECONSTRUCTION_ROADMAP.md)
- **Progress:** [RECONSTRUCTION_PROGRESS.md](RECONSTRUCTION_PROGRESS.md)
- **Decisions:** [RECONSTRUCTION_DECISIONS.md](RECONSTRUCTION_DECISIONS.md)
- **Checkpoints:** [RECONSTRUCTION_CHECKPOINTS.md](RECONSTRUCTION_CHECKPOINTS.md)

---

**Letzte Aktualisierung:** 14. November 2025, 15:50 UTC

---

## 📝 Wie man ein Issue meldet

Bei Problemen während der Rekonstruktion:

1. **Kopiere das Template** (oben)
2. **Fülle alle Felder aus**
3. **Erhöhe den nächsten Issue-Counter** (z.B. ISSUE-002)
4. **Aktualisiere** die Priority-Matrix am Anfang
5. **Linke die Entscheidung** in RECONSTRUCTION_DECISIONS.md wenn relevant

---

## 🛠️ Troubleshooting Guide

### Datenbank-Probleme

**Problem:** `pnpm db:push` schlägt fehl  
**Mögliche Ursachen:**
1. DATABASE_URL nicht gesetzt (.env)
2. Datenbank-Connection nicht möglich
3. Schema-Syntax-Fehler

**Lösung:**
```bash
# 1. .env prüfen
cat .env | grep DATABASE_URL

# 2. Connection testen
mysql -h [host] -u [user] -p [db]

# 3. Schema validieren
pnpm exec drizzle-kit validate
```

### tRPC-Router Fehler

**Problem:** Router wird nicht gefunden  
**Mögliche Ursachen:**
1. Router nicht in `server/routers.ts` importiert
2. Procedure-Typen falsch verwendet
3. Input-Schema fehlt

**Lösung:**
```typescript
// server/routers.ts
import { newRouter } from './routers/newRouter';

export const appRouter = router({
  // ... existing routers
  newRouter,  // ← Sicherstellen dass hinzugefügt
});
```

---

**Nächste Session:** Issue-Review nach Phase 1 Completion
