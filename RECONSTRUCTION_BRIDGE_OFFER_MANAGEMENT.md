# RECONSTRUCTION BRIDGE: Offer Management System

Diese temporäre Datei dokumentiert die komplette Rekonstruktion des Offer-Systems. Sie kann nach Review wieder gelöscht werden.

## Ziel
Fehlende Preisverhandlungs-Funktion (Offers) wieder herstellen: Datenbank-Funktionen, tRPC-Router, Frontend-Verwaltungsseite.

## Bestand vorher
- Tabelle `offers` existierte bereits im Schema.
- Keine DB-Funktionen für Angebote.
- Kein tRPC `offer` Router.
- Gelöschte / korrupte Seite `OfferManagement.tsx` aus Backup.
- Listings hatten `priceType='offer'` / `acceptsOffers`, aber kein Flow.

## Implementierte neue DB-Funktionen (`server/db.ts`)
- `createOffer(input)`
- `getOffersForSeller(sellerId, status?)`
- `getOffersForBuyer(buyerId, status?)`
- `getOfferById(id)`
- `acceptOffer(id)`
- `rejectOffer(id)`
- `counterOffer(id, counterAmount, counterMessage?)`
- `respondToCounter(id, action)`
- `expireOffers(now?)`
- `getPendingActionsForUser(userId)`

## Implementierter tRPC-Router (`offer` in `server/routers.ts`)
Procedures:
- `offer.create` – Käufer sendet Angebot.
- `offer.getMine` – Eigene (ausgehende) Angebote.
- `offer.getIncoming` – Eingehende Angebote für Verkäufer.
- `offer.getById` – Zugriffsbeschränkter Abruf.
- `offer.accept` – Verkäufer akzeptiert pending Angebot.
- `offer.reject` – Verkäufer lehnt pending Angebot ab.
- `offer.counter` – Verkäufer sendet Gegenangebot.
- `offer.respondToCounter` – Käufer reagiert (accept/reject) auf Gegenangebot.
- `offer.getPending` – Sammelübersicht notwendiger Aktionen.

Validierungen (Beispiele):
- Mindestpreis (`offerMinPrice`).
- Keine Angebote auf eigenes Listing.
- Status-Übergänge eingeschränkt (nur `pending` -> accept/reject/counter, nur `countered` -> respond).
- Gegenangebot höher als ursprüngliches (vereinfachte Logik).

## Frontend-Seite `client/src/pages/OfferManagement.tsx`
Tabs:
- Eingehend (Verkäufer-Sicht)
- Ausgehend (Käufer-Sicht)
- Aktionen (Pending/Countered getrennt)
- Neu (Form zum Erstellen – vereinfachtes Eingabeformular)

Aktionen:
- Accept / Reject (Seller)
- Counter (Seller)
- Respond Accept / Reject (Buyer bei countered)

State / Mutations:
- `trpc.offer.getIncoming/useQuery`
- `trpc.offer.getMine/useQuery`
- `trpc.offer.getPending/useQuery`
- Mutations: create, accept, reject, counter, respondToCounter

Route wieder aktiviert in `App.tsx` (`/offers`).

## Offene Punkte / Erweiterungen
- Automatisches Transaction-Erstellen bei `accept` (derzeit nur Statuswechsel).
- Optional: Mengen / Teilmengen unterstützen.
- System Setting: Expiry Dauer konfigurierbar (aktuell fest: 7 Tage).
- Geschäftslogik für Gegenangebote (höher vs. beliebig) klar definieren.
- UI: Filter / Suche / Pagination.
- E2E Tests für Offer-Flows.

## Löschung
Nach Abnahme kann diese Datei gelöscht werden, Änderungen bleiben im Code erhalten.

Letztes Update: 15.11.2025
