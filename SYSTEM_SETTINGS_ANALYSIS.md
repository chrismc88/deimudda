# System Settings Analyse & Empfehlungen

**Datum:** 16. November 2025  
**Status:** Vollständige Inventur & Gap-Analyse

---

## 📊 Aktuelle System Settings (Bestand)

### Payments (Gebühren)
| Key | Wert | Verwendung Frontend | Verwendung Backend | Status |
|-----|------|---------------------|-------------------|--------|
| `platform_fee_fixed` | 0.42 EUR | ✅ SellerTransactions, FeeStructure, FAQ, Privacy, SellerGuidelines | ✅ acceptOffer (db.ts) | ✅ Parametrisch |
| `paypal_fee_percentage` | 2.49% | ✅ FeeStructure, FAQ, SellerGuidelines | ✅ acceptOffer (db.ts) | ✅ Parametrisch |
| `paypal_fee_fixed` | 0.49 EUR | ✅ FeeStructure, FAQ, SellerGuidelines | ✅ acceptOffer (db.ts) | ✅ Parametrisch |

**✅ POSITIV:** Alle Gebühren sind dynamisch über System Settings gesteuert und werden korrekt im Frontend angezeigt!

### Limits
| Key | Wert | Verwendung | Status |
|-----|------|-----------|--------|
| `offer_expiration_days` | 7 | ✅ Backend: createOffer | ⚠️ Frontend: Hardcoded in einigen Stellen |
| `max_offers_per_listing` | 10 | ❌ Nicht implementiert | 🔴 Fehlt |
| `max_offers_per_user` | 20 | ❌ Nicht implementiert | 🔴 Fehlt |
| `min_offer_amount` | 1.00 EUR | ❌ Nicht implementiert | 🔴 Fehlt |
| `max_images_per_listing` | 8 | ❌ Nicht implementiert | 🔴 Fehlt |
| `max_image_size_mb` | 5 | ❌ Nicht implementiert | 🔴 Fehlt |
| `listing_auto_expire_days` | 30 | ❌ Nicht implementiert | 🔴 Fehlt |

### Verification
| Key | Wert | Verwendung | Status |
|-----|------|-----------|--------|
| `require_seller_profile_for_offers` | true | ❌ Nicht implementiert | 🔴 Fehlt |
| `email_verification_required` | false | ❌ Nicht implementiert | 🔴 Fehlt |

### System
| Key | Wert | Verwendung | Status |
|-----|------|-----------|--------|
| `maintenance_mode` | false | ❌ Nicht implementiert | 🔴 Fehlt |

### Branding
| Key | Wert | Verwendung | Status |
|-----|------|-----------|--------|
| `site_name` | Deimudda | ❌ Nicht verwendet | ⚠️ Hardcoded im Frontend |

---

## 🔍 Frontend Gebühren-Verwendung (Detailanalyse)

### ✅ Korrekt parametrisch umgesetzt:

1. **SellerTransactions.tsx** (Zeile 15-16)
   ```tsx
   const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
   const PLATFORM_FEE = parseFloat(platformFeeStr || "0.42");
   ```
   - Fallback auf 0.42 wenn Setting fehlt ✅
   - Berechnet korrekt: `totalPlatformFees = totalSales * PLATFORM_FEE`

2. **FeeStructure.tsx** (Zeile 11-17)
   ```tsx
   const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 });
   const { data: paypalFeePercentageStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_percentage', { staleTime: 300000 });
   const { data: paypalFeeFixedStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_fixed', { staleTime: 300000 });
   
   const platformFee = parseFloat(platformFeeStr || "0.42");
   const paypalPercentage = parseFloat(paypalFeePercentageStr || "0.0249");
   const paypalFixed = parseFloat(paypalFeeFixedStr || "0.49");
   ```
   - Live-Rechner mit dynamischen Gebühren ✅
   - Anzeige anpasst sich automatisch bei Setting-Änderungen ✅

3. **FAQ.tsx, SellerGuidelines.tsx, Privacy.tsx**
   - Alle laden Gebühren dynamisch via tRPC
   - Zeigen aktuelle Werte in Texten an ✅

### ⚠️ Problematische Hardcoded Werte:

**FeeStructure.tsx Zeile 96:**
```tsx
<strong>Gebühren-Struktur:</strong> PayPal-Gebühren (2,49% + €0.49) + Plattform-Gebühr (€{PLATFORM_FEE.toFixed(2)})
```
**Problem:** `2,49%` und `€0.49` sind im Text hardcoded, obwohl `paypalPercentage` und `paypalFixed` als Variablen existieren!

**FIX ERFORDERLICH:** Template String verwenden statt hardcoded Werte.

---

## 🚨 Kritische Lücken & Fehlende Implementierungen

### 1. Offer-Limits nicht durchgesetzt
**Was fehlt:**
- `max_offers_per_listing` → Check in `createOffer` fehlt
- `max_offers_per_user` → Check in `createOffer` fehlt
- `min_offer_amount` → Validation fehlt (Frontend + Backend)

**Risiko:** 🔴 **HOCH**
- Spam-Offers möglich
- DoS via massenhafter Offer-Erstellung
- User Experience leidet (Seller mit 100+ Offers)

### 2. Image-Limits nicht validiert
**Was fehlt:**
- `max_images_per_listing` → Check bei Image-Upload fehlt
- `max_image_size_mb` → Validation fehlt

**Risiko:** ⚠️ **MITTEL**
- Storage-Kosten unkontrolliert
- Performance-Probleme bei großen Bildern
- UX: Listings mit 50+ Bildern nicht nutzbar

### 3. Listing Auto-Expiration nicht implementiert
**Was fehlt:**
- Cron-Job oder Scheduled Task für `listing_auto_expire_days`
- Status-Update von `active` → `ended` nach Inaktivität

**Risiko:** ⚠️ **MITTEL**
- Veraltete Listings bleiben online
- DB wächst unkontrolliert
- Suchqualität leidet

### 4. Seller-Profil Requirement ignoriert
**Was fehlt:**
- Check `require_seller_profile_for_offers` in `acceptOffer`
- Frontend-Validierung bei Offer-Erstellung

**Risiko:** ⚠️ **MITTEL**
- Unvollständige Profile akzeptieren Offers
- Vertrauen in Plattform leidet

### 5. Maintenance Mode nicht funktional
**Was fehlt:**
- Middleware-Check in Express Server
- Frontend-Banner/Redirect bei aktivem Maintenance Mode

**Risiko:** ⚠️ **NIEDRIG**
- Keine geplante Wartung möglich ohne Downtime

### 6. Site Name nicht verwendet
**Aktuell:** Hardcoded "deimudda" in vielen Komponenten  
**Sollte:** Dynamisch aus `site_name` Setting laden  
**Betrifft:** Emails, Notifications, Meta-Tags, Footer

---

## 💡 Fehlende Settings (Empfohlene Ergänzungen)

### Kategorie: Payments (Erweitert)

#### 🔴 **KRITISCH - Dringend benötigt:**

1. **`min_transaction_amount`** (z.B. `5.00` EUR)
   - **Warum:** PayPal-Gebühren fressen bei Kleinstbeträgen zu viel (bei 2€ sind es 35%)
   - **Verwendung:** Validation in `acceptOffer`, Frontend-Warnung bei zu niedrigen Preisen
   - **Default:** `5.00`

2. **`seller_payout_minimum`** (z.B. `20.00` EUR)
   - **Warum:** Batch-Auszahlungen günstiger als einzelne Mini-Transaktionen
   - **Verwendung:** Seller muss mind. 20€ Guthaben haben für Auszahlung
   - **Default:** `20.00`

3. **`platform_fee_currency`** (z.B. `EUR`)
   - **Warum:** Multi-Currency Support vorbereiten
   - **Verwendung:** Anzeige, Berechnungen
   - **Default:** `EUR`

#### ⚠️ **WICHTIG - Sollte implementiert werden:**

4. **`refund_window_days`** (z.B. `14`)
   - **Warum:** Käuferschutz gemäß EU-Recht
   - **Verwendung:** Transaktionen können innerhalb X Tagen storniert werden
   - **Default:** `14`

5. **`seller_commission_rate`** (z.B. `0.00` für Start, später z.B. `5.00`)
   - **Warum:** Alternative/Zusätzliche Revenue-Source (% vom Verkaufspreis statt Fixgebühr)
   - **Verwendung:** Erweiterte Fee-Berechnung in `acceptOffer`
   - **Default:** `0.00` (aktuell nur Fixgebühr)

### Kategorie: Security

#### 🔴 **KRITISCH:**

6. **`max_login_attempts`** (z.B. `5`)
   - **Warum:** Brute-Force Protection
   - **Verwendung:** IP-Blocking nach X fehlgeschlagenen Logins
   - **Default:** `5`
   - **Status:** ❓ Evtl. schon in Rate-Limiter, aber nicht als Setting

7. **`session_lifetime_days`** (z.B. `14`)
   - **Warum:** Sicherheit vs. UX Balance
   - **Verwendung:** JWT/Cookie Expiry (aktuell 1 Jahr hardcoded in `ONE_YEAR_MS`)
   - **Default:** `14`
   - **Aktuell:** ❌ Hardcoded 1 Jahr in `shared/const.ts`

8. **`ip_block_duration_hours`** (z.B. `24`)
   - **Warum:** Automatisches Unblock nach Zeit
   - **Verwendung:** Blocked IPs auto-expire
   - **Default:** `24`

#### ⚠️ **WICHTIG:**

9. **`suspicious_activity_threshold`** (z.B. `10`)
   - **Warum:** Fraud Detection (z.B. 10 Offers in 1 Minute)
   - **Verwendung:** Rate-Limiting, Automatische Warnings
   - **Default:** `10`

10. **`require_2fa_for_sellers`** (z.B. `false`)
    - **Warum:** Extra Schutz für Seller-Accounts
    - **Verwendung:** Login-Flow Erweiterung
    - **Default:** `false` (Nice-to-Have)

### Kategorie: Notifications

#### ⚠️ **WICHTIG:**

11. **`notification_retention_days`** (z.B. `30`)
    - **Warum:** DB-Cleanup, alte Notifications löschen
    - **Verwendung:** Cron-Job für Cleanup
    - **Default:** `30`

12. **`email_notifications_enabled`** (z.B. `true`)
    - **Warum:** Global Email Toggle für Wartung
    - **Verwendung:** Email-Service Skip-Logik
    - **Default:** `true`

13. **`notification_batch_interval_minutes`** (z.B. `15`)
    - **Warum:** Email-Batching statt Spam (z.B. "5 neue Offers" statt 5 Emails)
    - **Verwendung:** Notification-Service
    - **Default:** `15`

### Kategorie: Listings

#### ⚠️ **WICHTIG:**

14. **`max_active_listings_per_user`** (z.B. `20`)
    - **Warum:** Prevent Spam, Fair Usage
    - **Verwendung:** Check bei Listing-Erstellung
    - **Default:** `20`

15. **`listing_featured_duration_days`** (z.B. `7`)
    - **Warum:** Premium-Feature (Featured Listings auto-expire)
    - **Verwendung:** Cron-Job für Status-Update
    - **Default:** `7` (Nice-to-Have)

16. **`require_listing_approval`** (z.B. `false`)
    - **Warum:** Moderations-Workflow
    - **Verwendung:** Listings starten als `draft` statt `active`
    - **Default:** `false`

### Kategorie: Search & Discovery

#### 💚 **NICE-TO-HAVE:**

17. **`search_results_per_page`** (z.B. `24`)
    - **Warum:** Performance-Tuning
    - **Verwendung:** Pagination-Limits
    - **Default:** `24`

18. **`featured_listings_count`** (z.B. `6`)
    - **Warum:** Homepage Featured Section
    - **Verwendung:** Homepage Query Limit
    - **Default:** `6`

### Kategorie: Rating & Reviews

#### ⚠️ **WICHTIG:**

19. **`enable_ratings`** (z.B. `true`)
    - **Warum:** Feature-Toggle für Rating-System
    - **Verwendung:** UI Show/Hide, API Guards
    - **Default:** `true`

20. **`min_transactions_for_rating`** (z.B. `1`)
    - **Warum:** Nur echte Käufer können bewerten
    - **Verwendung:** Rating-Form Validation
    - **Default:** `1`

### Kategorie: Messaging

#### ⚠️ **WICHTIG:**

21. **`max_message_length`** (z.B. `2000`)
    - **Warum:** Spam/Abuse Prevention
    - **Verwendung:** Frontend + Backend Validation
    - **Default:** `2000`

22. **`message_rate_limit_per_hour`** (z.B. `50`)
    - **Warum:** Prevent Message Spam
    - **Verwendung:** Rate-Limiter Middleware
    - **Default:** `50`

---

## 🎯 Priorisierte Umsetzungs-Roadmap

### **Phase 1: Kritische Fixes (Sofort)**

1. ✅ **Fix Hardcoded Gebühren in FeeStructure.tsx Text**
   - Zeile 96: Template String mit Variablen
   - Aufwand: 5 Minuten

2. 🔴 **Offer-Limits implementieren**
   - `max_offers_per_listing` Check in `createOffer`
   - `max_offers_per_user` Check in `createOffer`
   - `min_offer_amount` Validation (Frontend + Backend)
   - Aufwand: 2-3 Stunden

3. 🔴 **Session Lifetime Setting erstellen**
   - Setting: `session_lifetime_days` (14)
   - Refactor: `ONE_YEAR_MS` → dynamisches Setting
   - Verwendung: `server/_core/index.ts` + `sdk.ts`
   - Aufwand: 1 Stunde

### **Phase 2: Wichtige Erweiterungen (Diese Woche)**

4. ⚠️ **Payment Settings ergänzen**
   - `min_transaction_amount`
   - `seller_payout_minimum`
   - `refund_window_days`
   - Aufwand: 2 Stunden (Migration + Validierungen)

5. ⚠️ **Image-Limits durchsetzen**
   - `max_images_per_listing` Check bei Upload
   - `max_image_size_mb` Validation
   - Aufwand: 3 Stunden (Frontend + Backend)

6. ⚠️ **Security Settings**
   - `ip_block_duration_hours` → Auto-Unblock Cron
   - `max_login_attempts` → Formalisieren
   - Aufwand: 4 Stunden

### **Phase 3: Feature-Erweiterungen (Nächste Woche)**

7. 💚 **Maintenance Mode**
   - Middleware-Check in Server
   - Frontend-Banner/Redirect
   - Aufwand: 3 Stunden

8. 💚 **Listing Auto-Expiration**
   - Cron-Job für `listing_auto_expire_days`
   - Aufwand: 4 Stunden

9. 💚 **Dynamic Site Name**
   - Refactor alle "deimudda" Hardcodes → `site_name` Setting
   - Aufwand: 2 Stunden

### **Phase 4: Nice-to-Have (Später)**

10. Notification Settings
11. Search & Discovery Settings
12. Rating System Settings
13. Messaging Limits

---

## 📋 Zusammenfassung

### ✅ Was funktioniert gut:
- **Gebühren-System ist vollständig parametrisch** (Backend + Frontend)
- System Settings Infrastruktur existiert und ist erweiterbar
- tRPC Integration funktioniert gut (Caching, Fallbacks)

### 🔴 Kritische Probleme:
1. **Offer-Limits existieren aber werden nicht durchgesetzt** → Spam-Gefahr
2. **Session Lifetime 1 Jahr ist Sicherheitsrisiko** → Sollte 14 Tage sein
3. **Hardcoded Gebührenwerte in FeeStructure.tsx Text** → Inkonsistenz bei Änderungen

### ⚠️ Wichtige Lücken:
- Image-Upload Limits nicht validiert
- Maintenance Mode nicht funktional
- Listing Auto-Expiration fehlt
- Seller-Profil Requirements ignoriert
- Viele Security Settings fehlen

### 💚 Nice-to-Have für Zukunft:
- Message Rate-Limiting
- Featured Listings System
- Advanced Search Pagination
- 2FA für Seller

---

## 🛠️ Nächste Schritte

**Empfehlung:** Starte mit **Phase 1** (Kritische Fixes), da:
1. Schnell umsetzbar (3-4 Stunden gesamt)
2. Sofortige Verbesserung der Sicherheit
3. Verhindert potenzielle Probleme im Live-Betrieb

**Konkrete erste Aufgabe:**
```bash
# 1. Fix Hardcoded Fees in FeeStructure.tsx (5 Min)
# 2. Implement Offer Limits (2-3 Std)
# 3. Add Session Lifetime Setting (1 Std)
```

Soll ich mit der Implementierung beginnen?
