# System Settings – Analyse & Maßnahmen (Stand 17.11.2025)

Alle Werte liegen in `systemSettings` und werden über `server/db.ts#updateSystemSetting` gepflegt. Alias-Keys wie `max_images_per_listing` oder `max_image_size_mb` werden automatisch auf die kanonischen Keys (`max_listing_images`, `image_max_size_mb`) gemappt.

---

## Übersicht nach Kategorien

| Key | Default | Verwendung | Status |
| --- | --- | --- | --- |
| **Gebühren** ||||
| `platform_fee_fixed` | 0.42 € | AdminFees, SellerTransactions, `acceptOffer` | ✅ live |
| `paypal_fee_percentage` | 2.49 % | AdminFees, FeeStructure, `acceptOffer` | ✅ live |
| `paypal_fee_fixed` | 0.49 € | AdminFees, FeeStructure, `acceptOffer` | ✅ live |
| **Limits** ||||
| `max_offers_per_listing` | 10 | AdminLimits + `createOffer` | ✅ live |
| `max_offers_per_user` | 20 | AdminLimits + `createOffer` | ✅ live |
| `min_offer_amount` | 1.00 € | AdminLimits + `createOffer` | ✅ live |
| `max_listing_price` | 10 000 € | AdminLimits + Listing-Validation | ✅ live |
| `max_listing_images` | 10 | AdminLimits → Upload-Validation fehlt | ⚠ TODO |
| `image_max_size_mb` | 5 MB | AdminLimits → Upload-Validation fehlt | ⚠ TODO |
| `listing_auto_expire_days` | 30 | nicht genutzt | 🔴 |
| **Security & Sessions** ||||
| `session_lifetime_days` | 14 | `getSessionLifetimeMs` | ✅ |
| `ip_block_duration_hours` | 6 | IP-Auto-Unblock | ✅ |
| `max_login_attempts` | 5 | express-rate-limit + Login-Tracking | ✅ |
| `max_login_attempts_per_ip` | 5 | express-rate-limit | ✅ |
| `max_login_attempts_per_user` | 5 | Login-Tracking Warnungen | 🟡 (nur Logging) |
| `suspicious_activity_threshold` | 10/min | `trackLoginAttempt` (Auto-Block) | ✅ |
| `notification_retention_days` | 30 | Cleanup-Job | ✅ |
| **Branding / Global** ||||
| `site_name` | deimudda | `useSiteName`, Header, Footer | ✅ |
| `site_description` | Premium ... | AdminSettings, SEO TODO | 🟡 |
| `admin_email` | admin@deimudda.de | AdminSettings → E-Mail Vorlagen gepl. | 🟡 |
| `maintenance_mode` | false | AdminSettings Toggle, Enforce fehlt | 🟡 |
| `registration_enabled` | true | AdminSettings, Enforce fehlt | 🟡 |
| `require_listing_approval` | false | AdminSettings, Workflow offen | 🟡 |
| **Verification / Compliance** ||||
| `require_seller_profile_for_offers` | true | Validation geplant | 🔴 |
| `email_verification_required` | false | Meldungen offen | 🟡 |

Legende: ✅ aktiv · 🟡 teilweise / fehlende Nutzung · ⚠ umgesetzt, aber weitere Arbeit (z. B. Validierung) · 🔴 ungenutzt

---

## Verwendende Komponenten

- **AdminFees / AdminLimits / AdminSessions / AdminSettings** – komplette CRUD-Oberfläche für alle aktiven Keys.
- **Server** – `createOffer`, `acceptOffer`, `trackLoginAttempt`, IP-Blocker und Notification-Cleanup konsumieren die Limits und Security-Werte.
- **Frontend** – Seller-, FAQ- und Dashboard-Seiten laden Gebühren & Limits via `trpc.admin.getSystemSetting`.

---

## Offene Arbeiten

1. **Medien-Limits enforce** – Upload-Service an `max_listing_images` & `image_max_size_mb` koppeln.
2. **Maintenance Mode / Registration Toggle** – Middleware, die auf `maintenance_mode` reagiert und neue Registrierungen bei Bedarf sperrt.
3. **Listing Approval Workflow** – Setting `require_listing_approval` auswerten (Admin Review Queue).
4. **Seller Profile Requirement** – `require_seller_profile_for_offers` beim Offer-Empfang prüfen.
5. **Site Description / Branding** – `site_description` in SEO-Meta, Footer und OG-Tags einbinden.
6. **Auslaufende Listings** – `listing_auto_expire_days` implementieren (Cron Cleanup).

---

## Pflegehinweise

- Neue Keys immer per Migration (`drizzle/00xx_*`) seeden.
- `updateSystemSetting` setzt `updatedAt` + `updatedBy`; Admin-UI ruft ausschließlich diese tRPC-Prozedur.
- Fallback-Werte sollten nur temporär im Code bleiben – sobald Settings existieren, Fehler loggen statt zu schweigen.

Damit bleiben Code und Konfiguration konsistent, und alle Teams greifen auf dieselbe Quelle zu.
