# Dokumentations-Konsolidierung (15. November 2025)

## 🎯 Ziel: Schlanke, wartbare 3-Stufen-Doku

### Neue Struktur (KEEP):
```
📁 Root
├── README.md                  ← Quick Start, Setup, Dev-Login Config
├── CHANGELOG.md              ← Version History, Updates (NEU)
├── STATUS.md                 ← Aktueller Stand: Features, Progress, TODOs (NEU - ersetzt 5 Dateien)
├── AGENTS.md                 ← AI Guidelines (KEEP)
├── PAYPAL_SETUP.md           ← Spezifisches Setup (KEEP)
└── docs/                     ← Detaillierte Dokumentation (NEU)
    ├── ARCHITECTURE.md       ← System-Design, DB-Schema
    ├── API.md                ← tRPC Router Reference
    ├── DEVELOPMENT.md        ← Dev-Guide, Workflows
    └── DEPLOYMENT.md         ← Production Setup
```

---

## 🗑️ Zu LÖSCHEN (Duplikate/Veraltet):

### Reconstruction-Dateien (Historisch, nicht mehr relevant):
- ❌ RECONSTRUCTION_START.md → Migration komplett, nicht mehr nötig
- ❌ RECONSTRUCTION_INDEX.md → Ersetzt durch STATUS.md
- ❌ RECONSTRUCTION_SESSION_SUMMARY.md → Veraltet
- ❌ RECONSTRUCTION_ROADMAP.md → Phase 1-3 komplett, ersetzt durch STATUS.md
- ❌ RECONSTRUCTION_PROGRESS.md → Daily logs veraltet
- ❌ RECONSTRUCTION_DECISIONS.md → Architektur in docs/ARCHITECTURE.md
- ❌ RECONSTRUCTION_CHECKPOINTS.md → Nicht mehr nötig
- ❌ RECONSTRUCTION_ISSUES.md → Leer, nicht verwendet

### Status-Report-Duplikate:
- ❌ PROJECT_STATUS_REPORT.md → Duplikat von PROJECT_STATUS.md
- ❌ PROJECT_STATUS.md → Wird zu STATUS.md (kürzer)

### Phase-Completion-Reports:
- ❌ PHASE_1_SUMMARY.md → Historisch
- ❌ PHASE_1_COMPLETION_REPORT.md → Historisch

### Temporäre Fix-Dokumentationen:
- ❌ FORM_DATA_LOADING_FIXES.md → Fixes implementiert
- ❌ MISSING_PAGES_IMPLEMENTATION_STATUS.md → Pages implementiert
- ❌ CONSISTENCY_CHECK_REPORT.md → Check durchgeführt
- ❌ BACKUP_ANALYSIS.md → Analyse abgeschlossen
- ❌ BACKUP_ANALYSIS_ADDITIONAL.md → Analyse abgeschlossen

### Test/Temporär:
- ❌ test.md → Temp-Datei

**Total zu löschen: 18 Dateien**

---

## ✅ Zu AKTUALISIEREN/KONSOLIDIEREN:

### TODO.md → Wird Teil von STATUS.md
- Roadmap-Section
- Known Issues
- Next Steps

### README.md → BLEIBT (mit Updates)
- Quick Start ✅
- Dev-Login Config ✅
- Docker Setup ✅
- Common Commands ✅

### AGENTS.md → BLEIBT
- Repository Guidelines ✅
- Bereits aktuell

### PAYPAL_SETUP.md → BLEIBT
- Spezifische Integration
- Standalone sinnvoll

---

## 📝 Neue Dateien zu ERSTELLEN:

### STATUS.md (Master-Übersicht)
Konsolidiert:
- PROJECT_STATUS.md
- PROJECT_STATUS_REPORT.md
- TODO.md (Roadmap-Teil)
- RECONSTRUCTION_ROADMAP.md (Phase-Status)

**Struktur:**
```markdown
# deimudda - Projekt-Status

## Übersicht (5 Zeilen)
## Features (Tabelle: Feature | Status | Notes)
## Roadmap (3-6 Monate Ausblick)
## Known Issues (nur aktive)
## Contributing (Quick Guide)
```

### CHANGELOG.md (Version History)
```markdown
# Changelog

## [Unreleased]
- Dev-Login Gating implementiert
- Messages/Chat Pages erstellt
- ...

## [0.1.0] - 2025-11-15
- Initial Beta Release
- Phase 1-3 Complete
```

### docs/ARCHITECTURE.md
Konsolidiert:
- DB-Schema (aus verschiedenen Dateien)
- System-Design
- Tech Stack
- Security Model

### docs/API.md
- tRPC Router Reference
- Procedures
- Input/Output Types

### docs/DEVELOPMENT.md
- Setup Guide
- Code Style
- Testing
- Common Tasks

### docs/DEPLOYMENT.md
- Production Setup
- Environment Variables
- Docker
- Monitoring

---

## 🚀 Migrations-Plan:

### Schritt 1: Neue Dateien erstellen
- [x] STATUS.md (konsolidiert)
- [ ] CHANGELOG.md
- [ ] docs/ARCHITECTURE.md
- [ ] docs/API.md
- [ ] docs/DEVELOPMENT.md
- [ ] docs/DEPLOYMENT.md

### Schritt 2: Bestehende aktualisieren
- [ ] README.md (Link auf docs/)
- [ ] TODO.md → In STATUS.md integrieren, dann löschen

### Schritt 3: Cleanup
- [ ] 18 veraltete Dateien löschen

---

## 📊 Vorher/Nachher:

**Vorher:** 22 MD-Dateien (Root) + Backup-Docs
**Nachher:** 6 MD-Dateien (Root) + 4 MD-Dateien (docs/)

**Reduktion:** ~65% weniger Dateien, 100% aktuellere Infos
