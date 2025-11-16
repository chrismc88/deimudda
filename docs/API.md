# API – deimudda (tRPC)

Referenz der wichtigsten Router und Procedures.

## Router-Übersicht
- auth: Login/Logout/me
- profile: Profil-Update, Seller aktivieren
- seller: Profile Management
- listing: CRUD, Aktivieren/Deaktivieren
- transaction: Create/Get/Complete/Cancel
- review: Create/Get/Update
- admin: Moderation, Stats, Security, Settings, Analytics
- notifications: Get/Mark/Unread/Delete
- chat: Conversations/Messages/Unread
- paypal: Create/Capture

## IO-Schemata
- Eingaben/Ausgaben über zod-validierte Typen (siehe `shared/validation.ts`)

## Hinweise
- Keine SQL im Router – Logik in `server/db.ts`
- Fehler als tRPC Errors (Codes: NOT_FOUND, BAD_REQUEST, FORBIDDEN)
