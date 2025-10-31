# PayPal-Integration für deimudda

## Aktueller Status

Die PayPal-Integration ist **im Mock-Modus** implementiert. Das bedeutet:
- ✅ Die Checkout-Seite ist fertig
- ✅ Die Backend-Integration ist vorbereitet
- ❌ Echte Zahlungen sind noch nicht aktiviert

---

## PayPal-Konto erstellen

### 1. PayPal-Geschäftskonto erstellen

1. Gehen Sie zu: https://www.paypal.com/de/business
2. Klicken Sie auf "Geschäftskonto eröffnen"
3. Füllen Sie das Formular aus:
   - **Geschäftstyp:** Einzelunternehmen oder GmbH
   - **Geschäftsname:** deimudda
   - **E-Mail-Adresse:** Ihre geschäftliche E-Mail
4. Verifizieren Sie Ihr Konto (Bankkonto verknüpfen)

### 2. PayPal-API-Schlüssel erstellen

1. Gehen Sie zu: https://developer.paypal.com/dashboard/
2. Melden Sie sich mit Ihrem PayPal-Konto an
3. Klicken Sie auf "Apps & Credentials"
4. Wählen Sie "Live" (für echte Zahlungen) oder "Sandbox" (für Tests)
5. Klicken Sie auf "Create App"
6. Geben Sie einen Namen ein (z.B. "deimudda")
7. Kopieren Sie die folgenden Werte:
   - **Client ID** (öffentlich)
   - **Secret** (geheim, niemals teilen!)

---

## Umgebungsvariablen setzen

### Im Manus Management UI:

1. Öffnen Sie das Management UI (rechts neben dem Chat)
2. Gehen Sie zu **Settings → Secrets**
3. Fügen Sie folgende Secrets hinzu:

```
PAYPAL_CLIENT_ID=<Ihre Client ID>
PAYPAL_CLIENT_SECRET=<Ihr Secret>
PAYPAL_MODE=live
```

**Wichtig:** Für Tests verwenden Sie `PAYPAL_MODE=sandbox`

---

## Gebührenmodell

### PayPal-Gebühren (Standard):
- **2,49% + 0,49 €** pro Transaktion

### deimudda-Provision:
- **0,42 €** pro verkauftem Steckling

### Beispiel-Rechnung:

**Szenario:** Verkäufer verkauft 1 Steckling für 5,00 €

1. **Käufer zahlt:**
   - Steckling: 5,00 €
   - PayPal-Gebühren: 0,61 € (2,49% + 0,49 €)
   - **Gesamt: 5,61 €**

2. **PayPal zieht ab:**
   - PayPal-Gebühren: 0,61 €
   - deimudda-Provision: 0,42 €
   - **Gesamt abgezogen: 1,03 €**

3. **Verkäufer erhält:**
   - **4,58 €** (5,61 € - 1,03 €)

---

## Automatische Auszahlungen

Die Plattform ist so konfiguriert, dass:
1. Käufer zahlt an PayPal
2. PayPal zieht automatisch ab:
   - PayPal-Gebühren (0,61 €)
   - deimudda-Provision (0,42 €)
3. Verkäufer erhält den Rest (4,58 €) direkt auf sein PayPal-Konto

**Keine manuellen Auszahlungen notwendig!**

---

## Aktivierung

Nachdem Sie die Umgebungsvariablen gesetzt haben:

1. Speichern Sie einen neuen Checkpoint
2. Veröffentlichen Sie die Plattform neu
3. Testen Sie eine Zahlung (im Sandbox-Modus)
4. Wechseln Sie zu `PAYPAL_MODE=live` für echte Zahlungen

---

## Support

Bei Problemen:
- PayPal-Support: https://www.paypal.com/de/smarthelp/home
- PayPal-Developer-Docs: https://developer.paypal.com/docs/

