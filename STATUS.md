# Projektstatus – Stand 17. November 2025

Kurzer Health-Check für Team & Stakeholder. Quelle: aktueller Branch `002-sandbox`.

---

## 🧭 Zusammenfassung

- **Status:** Gelb – Plattform funktionsfähig, verbleibende Lücken bei OfferManagement, OAuth & PayPal-Livebetrieb.
- **Stabil:** Offers, Listings, Messaging, Notifications, Admin-Suite, IP-Blocking, dynamische Settings.
- **Offen:** OfferManagement-UI, produktionsreife Auth (OAuth), PayPal-Webhooks & -Payouts, E2E- und Load-Tests, Deployment-Playbook.

---

## ✅ Feature-Reife

| Bereich | Status | Notizen |
| --- | --- | --- |
| Offers & Listings | 🟢 | Counter/Accept inkl. `reduceListingQuantity`, Limits aus `systemSettings` |
| Messaging & Notifications | 🟢 | Chat + Unread Badges, Cleanup-Job (`notification_retention_days`) |
| Admin Suite | 🟢 | Fees, Limits, Sessions, Settings, Security (IP-Logs, Block/Unblock) |
| Security | 🟡 | Rate-Limits, Login-Tracking & Auto-Blocking aktiv; OAuth & Helmet/CORS-Härtung offen |
| Payments | 🟡 | Gebühren konfigurierbar, PayPal SDK eingebunden, Live/Webhooks fehlen |
| Tests & QA | 🟠 | Vitest-Skelette vorhanden, aber ohne reale DB/Mocks laufen viele Suites leer |
| Deployment | 🟠 | Docker-Setup vorhanden, CI/CD, Monitoring & Backup-Prozesse offen |

---

## 🔥 Aktuelle Schwerpunkte

1. **OfferManagement-Page** – Neue UI + Hooks für eingehende / ausgehende Angebote.
2. **Auth-Härtung** – OAuth Provider & Policies (Dev-Login nur lokal).
3. **Payments** – PayPal Sandbox ↔ Live, Settlement, Webhooks, Seller-Payout-Workflow.
4. **Tests** – Vitest mit DB-Mocks, anschließende E2E (Playwright/Cypress).
5. **Ops** – Deployment-Doku, CI-Pipeline, Monitoring & Backups.

---

## ⚠ Risiken & Schulden

- **Dokumentation:** viele Berichte (TODO, PROJECT_STATUS, AKTUELLER_PROJEKT_STAND) waren veraltet – ab sofort auf `STATUS.md` & `ROADMAP.md` konsolidiert.
- **Tests:** Vitest-Suites überspringen Logik wegen fehlender DB – Gefahr von Regressionen.
- **Payments/OAuth:** noch nicht produktionsreif → Blocker für Launch.
- **OfferManagement UI:** Seite existiert nicht mehr, Käufer:innen haben nur API-Flow.

---

## 📅 Nächste Schritte (chronologisch)

1. **KW 47 – Core UX**
   - OfferManagement-Seite + Hooks + Admin-Links fertigstellen.
   - Seller-/Buyer-Flows mit realen Daten testen.
2. **KW 48 – Auth & Payments**
   - OAuth (Google oder Keycloak) und PayPal-Sandbox-End-to-End.
   - Live-Konfiguration + Webhook-Handler.
3. **KW 49 – Tests & Docs**
   - Vitest + Playwright Abdeckung für Offers, Admin, Security.
   - Deployment Guide & Runbooks (Monitoring, Backups, Secrets).
4. **KW 50 – Launch Readiness**
   - Hardening (Helmet, CORS, Body-Limits, CSRF).
   - Performance-/Load-Test, Bug Bash, Release Candidate.

---

## 📓 Referenzen

- `ROADMAP.md` – detaillierter Fahrplan
- `SYSTEM_SETTINGS_ANALYSIS.md` – vollständige Setting-Liste
- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`
- Letzte Commits: `feat(admin): wire system settings and tighten security`, `fix(server): ensure system settings upsert`
