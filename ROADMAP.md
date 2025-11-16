# Roadmap – Winter 2025

Chronologischer Fahrplan für den Abschluss der Plattform. Ergänzt `STATUS.md` um detaillierte Tasks.

---

## Phase 1 – Core Experience (KW 47)

### OfferManagement Rebuild
- [ ] Neue React-Page inkl. Tabs (eingehend / ausgehend).
- [ ] Hooks `useOffersReceived`, `useOffersSent` (Pagination, Filter).
- [ ] Aktionen (accept / reject / counter) per tRPC anbinden.
- [ ] Verlinkung aus Dashboard + Admin.

### UX & Copy
- [ ] Dynamische FAQ/Fee-Texte gegen Settings prüfen.
- [ ] Header/Footer Screenshots & Docs aktualisieren.
- [ ] Seller-Dashboard Texte (Gebühren, Limits) synchronisieren.

Deliverable: Käufer:innen und Admins sehen jederzeit aktuelle Offers.

---

## Phase 2 – Auth & Payments (KW 48)

### OAuth Integration
- [ ] Provider auswählen (Google / Keycloak).
- [ ] tRPC Session-Flow anpassen, Dev-Login hinter Flag lassen.
- [ ] Tests für Login, Logout, Session Expiry (`session_lifetime_days`).

### PayPal Produktionsreife
- [ ] Sandbox Kauf → Zahlung → Seller-Payout simulieren.
- [ ] Webhook-Handler + Retry-Logik implementieren.
- [ ] Dokumentierte Setup-Schritte (`PAYPAL_SETUP.md` aktualisieren).

Deliverable: Produktive Authentifizierung + verifizierbare Zahlungsstrecke.

---

## Phase 3 – Quality & Ops (KW 49)

### Testing
- [ ] Vitest: Offers, AdminSecurity, Settings.
- [ ] Playwright/Cypress: Kernflows (Login, Listing erstellen, Offer annehmen).
- [ ] Seed-Daten für Tests vereinheitlichen.

### Documentation & Tooling
- [ ] Deployment Guide (Docker/CI/CD).
- [ ] Monitoring/Alerting Entwurf (z.B. Sentry, UptimeRobot).
- [ ] Backup-Konzept für MySQL (snapshots, point-in-time).

Deliverable: Reproduzierbare Deployments & belegbarer Qualitätsnachweis.

---

## Phase 4 – Hardening & Launch (KW 50)

- [ ] Security: Helmet, CORS, Body-Limits, CSRF/Origin-Checks.
- [ ] Performance: Profiling + Lasttest, evtl. Caching.
- [ ] Bug Bash + Release Candidate.
- [ ] Launch Checklist (Rollout, Rollback, Supportkontakte).

Deliverable: “Go/No-Go”-Entscheidung mit dokumentierten Kriterien.

---

## Langfristige Ideen (Backlog)

- Seller-Rating & Review-Erweiterungen.
- Push-/E-Mail-Notifications.
- Analytics-Modul (AdminStats).
- Marketplace-Suche (Full-Text, Filter, Sortierung).

---

**Wartung:** Bitte alle neuen Planungsnotizen direkt in `ROADMAP.md` ergänzen und veraltete Einzel-Dokumente vermeiden. Dadurch bleibt die Kommunikation konsistent.
