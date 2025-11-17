# Admin Module – Funktionsübersicht

Stand: 17.11.2025. Beschreibt die wichtigsten Admin-Seiten inkl. primärer Aktionen und Referenzen. Screenshots können bei Bedarf anhand dieser Struktur erstellt und eingebunden werden.

---

## Admin Dashboard (`/admin/dashboard`)
- Komponenten: `client/src/pages/AdminDashboard.tsx`
- Anzeige von KPIs (User, Listings, Transaktionen, Reports)
- Schnellzugriff auf zuletzt gemeldete Inhalte
- Cards für Gebührenstatus & Security-Hinweise

## Users (`/admin/users`)
- Datei: `AdminUsers.tsx`
- Such- und Filterfunktionen (Rolle, Status)
- Aktionen: warnen, sperren, entsperren, Rolle ändern
- Nutzt `admin.warnUser`, `admin.suspendUser`, `admin.promoteToAdmin` etc.

## Listings (`/admin/listings`)
- Datei: `AdminListings.tsx`
- Moderation von Listings (Blocken/Entblocken, Löschen)
- Einsicht in Seller-Daten, Reports und Status

## Transactions (`/admin/transactions`)
- Datei: `AdminTransactions.tsx`
- Übersicht über alle Transaktionen inkl. PayPal-/Plattformgebühren
- Filter nach Status, Zeitraum, Seller/User

## Reports (`/admin/reports`)
- Datei: `AdminReports.tsx`
- Workflow für Community-Reports (pending → resolved)
- Zugriff auf Report-Details und Moderations-Aktionen

## Logs (`/admin/logs`)
- Datei: `AdminLogs.tsx`
- Anzeige des Audit-Trails (`adminLogs` Tabelle)
- Filter nach Admin, Aktion, Zeitraum

## Fees (`/admin/fees`)
- Datei: `AdminFees.tsx`
- Verwaltet `platform_fee_fixed`, `paypal_fee_percentage`, `paypal_fee_fixed`
- Live-Kalkulation und Beispielrechnungen

## Limits (`/admin/limits`)
- Datei: `AdminLimits.tsx`
- Settings u. a. `max_offers_per_listing`, `min_offer_amount`, `max_listing_price`, `max_listing_images`, `image_max_size_mb`
- Validierung (int/float) + Rückmeldung an das `systemSettings` Backend

## Sessions & Security (`/admin/sessions`)
- Datei: `AdminSessions.tsx`
- Settings für `session_lifetime_days`, `ip_block_duration_hours`, `max_login_attempts`, `suspicious_activity_threshold`, `notification_retention_days`
- Fokus auf Login-Schutz & Cleanup

## Global Settings (`/admin/settings`)
- Datei: `AdminSettings.tsx`
- `site_name`, `site_description`, `admin_email`, `maintenance_mode`, `registration_enabled`, `require_listing_approval`
- Informiert Super-Admins und erlaubt Live-Anpassungen

## Security (`/admin/security`)
- Datei: `AdminSecurity.tsx`
- IP-Blocking, Login-Versuche, verdächtige IPs
- Ruft `db.blockIP`, `db.unblockIP`, `db.getIPsWithMostAttempts` etc. auf

---

### Hinweise für Screenshots
1. **Breite:** 1280 px Desktop-Ansicht verwenden.
2. **Light Mode:** Standard-Theme der Admin-Pages; ideal für Docs/README.
3. **Callouts:** Für jede Seite einen kurzen Text (siehe oben) + Bild in `docs/images/admin-*.png`.
4. **Aktualisierung:** Nach UI-Änderungen sowohl Bild als auch Text aktualisieren, damit Docs konsistent bleiben.

Diese Datei dient als „Single Source of Truth“ für die Admin-Oberfläche und soll bei neuen Modulen erweitert werden.
