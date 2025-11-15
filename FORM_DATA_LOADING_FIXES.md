# Form Data Loading Fixes - Vollständige Dokumentation

## Problem-Beschreibung

**Hauptproblem:** Beim Bearbeiten von Profilen, Listings und anderen Formularen werden die vorhandenen Daten NICHT in die Input-Felder geladen. Stattdessen bleiben die Felder leer oder zeigen alte/falsche Daten an.

**Ursache:** 
1. React State wurde mit leeren Werten initialisiert
2. `useEffect` Hooks hatten falsche oder fehlende Dependencies
3. Dialog-Schließen setzte Formulardaten nicht zurück
4. Race Conditions beim Laden von User-Daten

---

## 1. Profile.tsx - User Profil Bearbeitung

### Problem
- `formData` wurde mit `user?.nickname` initialisiert, aber beim ersten Render war `user` noch `null`
- `useEffect` hatte zu spezifische Dependencies (`user?.id`, `user?.nickname`, etc.)
- Dies führte zu unnötigen Re-Renders oder fehlenden Updates

### Lösung
```typescript
// VORHER (FALSCH):
const [formData, setFormData] = useState({
  nickname: user?.nickname || "",  // user ist beim ersten Render null!
  location: user?.location || "",
  profileImageUrl: user?.profileImageUrl || "",
});

useEffect(() => {
  if (user) {
    setFormData({ ... });
  }
}, [user?.id, user?.nickname, user?.location, user?.profileImageUrl]); // Zu viele Dependencies!

// NACHHER (KORREKT):
const [formData, setFormData] = useState({
  nickname: "",
  location: "",
  profileImageUrl: "",
});

useEffect(() => {
  if (user) {
    setFormData({
      nickname: user.nickname || "",
      location: user.location || "",
      profileImageUrl: user.profileImageUrl || "",
    });
  }
}, [user]); // Nur user als Dependency!
```

### Mutation Fix
```typescript
// VORHER:
const updateProfile = trpc.profile.update.useMutation({
  onSuccess: () => {
    toast.success("Profil erfolgreich aktualisiert!");
    window.location.reload(); // Kompletter Page Reload!
  },
});

// NACHHER:
const updateProfile = trpc.profile.update.useMutation({
  onSuccess: async () => {
    toast.success("Profil erfolgreich aktualisiert!");
    await utils.auth.me.invalidate();
    await refresh();
  },
});
```

**Ergebnis:** Formulardaten werden korrekt geladen UND nach dem Speichern ohne Page Reload aktualisiert.

---

## 2. SellerDashboard.tsx - Listing Bearbeitung

### Problem
- Edit-Dialog hatte `onOpenChange={setIsEditDialogOpen}` ohne State-Reset
- Beim Schließen des Dialogs blieben alte Formulardaten erhalten
- Beim nächsten Öffnen wurden die alten Daten angezeigt

### Lösung - Dialog Handler hinzugefügt

```typescript
// NEU HINZUGEFÜGT:
const handleEditDialogOpenChange = (open: boolean) => {
  setIsEditDialogOpen(open);
  if (!open) {
    // Reset form data when closing edit dialog
    setFormData(initialFormData);
    setEditingListing(null);
  }
};

// Dialog JSX:
<Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
  {/* ... */}
</Dialog>
```

### handleEditClick - Daten laden

```typescript
const handleEditClick = (listing: any) => {
  setEditingListing(listing);
  
  // Parse images array if it's a JSON string
  let imagesArray: string[] = [];
  if (listing.images) {
    try {
      imagesArray = typeof listing.images === 'string' 
        ? JSON.parse(listing.images) 
        : listing.images;
    } catch (e) {
      imagesArray = [];
    }
  }
  
  const nextPriceType = listing.priceType || (listing.acceptsOffers ? "offer" : "fixed");
  const parsedFixedPrice = listing.fixedPrice ? parseFloat(listing.fixedPrice) : 0;
  const parsedOfferMin = listing.offerMinPrice ? parseFloat(listing.offerMinPrice) : 0;
  
  setFormData({
    type: listing.type,
    strain: listing.strain,
    listingDescription: listing.description,
    quantity: listing.quantity,
    priceType: nextPriceType,
    fixedPrice: nextPriceType === "fixed" ? parsedFixedPrice : 0,
    offerMinPrice: nextPriceType === "offer" ? parsedOfferMin : 0,
    imageUrl: listing.imageUrl || "",
    images: imagesArray,
    shippingVerified: listing.shippingVerified ?? true,
    shippingPickup: listing.shippingPickup ?? false,
    genetics: listing.genetics || "",
    seedBank: listing.seedBank || "",
    growMethod: listing.growMethod || "",
    seedType: listing.seedType || "",
    thcContent: listing.thcContent || "",
    cbdContent: listing.cbdContent || "",
    floweringTime: listing.floweringTime || "",
    yieldInfo: listing.yieldInfo || "",
    origin: listing.origin || "",
    flavorProfile: listing.flavorProfile || "",
  });
  
  setIsEditDialogOpen(true);
};
```

### Update Mutation Fix

```typescript
// VORHER:
const updateListing = trpc.listing.update.useMutation({
  onSuccess: () => {
    myListings.refetch();
  },
});

// NACHHER:
const updateListing = trpc.listing.update.useMutation({
  onSuccess: () => {
    toast.success("Angebot erfolgreich aktualisiert!");
    myListings.refetch();
    setIsEditDialogOpen(false);      // Dialog schließen
    setFormData(initialFormData);    // Form zurücksetzen
    setEditingListing(null);          // Editing State löschen
  },
  onError: (error) => {
    toast.error("Fehler beim Aktualisieren: " + error.message);
  },
});
```

### Create Dialog Handler

```typescript
const handleCreateDialogOpenChange = (open: boolean) => {
  setIsCreateDialogOpen(open);
  if (!open) {
    setCreateImageFieldError(null);
    setFormData(initialFormData); // Form zurücksetzen beim Schließen
  }
};
```

**Ergebnis:** 
- Listing-Daten werden beim Edit korrekt geladen
- Dialog schließt automatisch nach Speichern
- Beim erneuten Öffnen sind die Felder sauber

---

## 3. AdminUsers.tsx - Admin Aktionen (Warn, Suspend, Ban, Promote)

### Problem
- 4 verschiedene Dialoge (Warn, Suspend, Ban, Promote) ohne State-Reset
- Formulardaten blieben beim Schließen erhalten
- "Abbrechen"-Buttons verwendeten direkte `setState` Calls

### Lösung - 4 neue Dialog-Handler

```typescript
// NEU HINZUGEFÜGT:
const handleWarnDialogOpenChange = (open: boolean) => {
  setWarnDialogOpen(open);
  if (!open) {
    setWarnMessage("");
    setWarnReason("tos_violation");
    setSelectedUser(null);
  }
};

const handleSuspendDialogOpenChange = (open: boolean) => {
  setSuspendDialogOpen(open);
  if (!open) {
    setSuspendReason("");
    setSuspendDays("7");
    setSelectedUser(null);
  }
};

const handleBanDialogOpenChange = (open: boolean) => {
  setBanDialogOpen(open);
  if (!open) {
    setBanReason("");
    setSelectedUser(null);
  }
};

const handlePromoteDialogOpenChange = (open: boolean) => {
  setPromoteDialogOpen(open);
  if (!open) {
    setSelectedUser(null);
  }
};
```

### Mutation Fixes - State Reset in onSuccess

```typescript
// Warn Mutation:
const warnUserMutation = trpc.admin.warnUser.useMutation({
  onSuccess: () => {
    toast.success("Nutzer wurde erfolgreich verwarnt");
    refetch();
    setWarnDialogOpen(false);
    setWarnMessage("");
    setWarnReason("tos_violation");  // Reset auf Default
    setSelectedUser(null);            // User-Selection löschen
  },
});

// Suspend Mutation:
const suspendUserMutation = trpc.admin.suspendUser.useMutation({
  onSuccess: () => {
    toast.success("Nutzer wurde erfolgreich gesperrt");
    refetch();
    setSuspendDialogOpen(false);
    setSuspendReason("");
    setSuspendDays("7");              // Reset auf Default
    setSelectedUser(null);
  },
});

// Ban Mutation:
const banUserMutation = trpc.admin.banUser.useMutation({
  onSuccess: () => {
    toast.success("Nutzer wurde erfolgreich gebannt");
    refetch();
    setBanDialogOpen(false);
    setBanReason("");
    setSelectedUser(null);
  },
});

// Promote Mutation:
const promoteToAdminMutation = trpc.admin.promoteToAdmin.useMutation({
  onSuccess: () => {
    toast.success("Nutzer wurde erfolgreich zum Admin ernannt");
    refetch();
    setPromoteDialogOpen(false);
    setSelectedUser(null);
  },
});
```

### Button Fixes - Verwende neue Handler

```typescript
// VORHER:
<Button variant="outline" onClick={() => setWarnDialogOpen(false)}>
  Abbrechen
</Button>

// NACHHER:
<Button variant="outline" onClick={() => handleWarnDialogOpenChange(false)}>
  Abbrechen
</Button>
```

**Ergebnis:** Alle Admin-Dialoge setzen ihre States korrekt zurück, egal ob via Button, X oder ESC geschlossen.

---

## 4. BuyerDashboard.tsx - Review Dialog

### Status
✅ **Bereits korrekt implementiert!**

```typescript
// Review Dialog Schließen - korrekt implementiert:
<button
  onClick={() => {
    setReviewDialogOpen(false);
    setSelectedTransaction(null);
    setRating(0);
    setComment("");
  }}
>
  Abbrechen
</button>
```

**Keine Änderungen erforderlich.**

---

## Zusammenfassung aller Änderungen

### Dateien geändert:
1. ✅ `client/src/pages/Profile.tsx` - User Profil Bearbeitung
2. ✅ `client/src/pages/SellerDashboard.tsx` - Listing Bearbeitung
3. ✅ `client/src/pages/AdminUsers.tsx` - Admin Aktionen
4. ✅ `server/routers.ts` - Debug-Logging hinzugefügt

### Patterns implementiert:

#### Pattern 1: Dialog Handler mit State Reset
```typescript
const handleDialogOpenChange = (open: boolean) => {
  setDialogOpen(open);
  if (!open) {
    // Reset ALL form states here
    setFormData(initialData);
    setSelectedItem(null);
  }
};
```

#### Pattern 2: Mutation onSuccess mit vollständigem Cleanup
```typescript
const mutation = trpc.something.useMutation({
  onSuccess: () => {
    toast.success("Erfolgreich!");
    refetch();              // Daten neu laden
    setDialogOpen(false);   // Dialog schließen
    setFormData(initial);   // Form zurücksetzen
    setSelected(null);      // Selection löschen
  },
});
```

#### Pattern 3: useEffect mit korrekten Dependencies
```typescript
// User-Daten laden:
useEffect(() => {
  if (user) {
    setFormData({
      field1: user.field1 || "",
      field2: user.field2 || "",
    });
  }
}, [user]); // Nur user als Dependency!
```

---

## Testing Checklist

### Profile.tsx
- [ ] Profil öffnen → Nickname wird angezeigt
- [ ] Nickname ändern → Speichern → Erfolgs-Toast
- [ ] Page reload (F5) → Neuer Nickname wird angezeigt

### SellerDashboard.tsx
- [ ] Listing bearbeiten → Alle Felder sind gefüllt
- [ ] Änderungen speichern → Dialog schließt automatisch
- [ ] Erneut bearbeiten → Aktuelle Daten werden angezeigt
- [ ] Dialog mit X schließen → Beim nächsten Öffnen sind Felder leer

### AdminUsers.tsx
- [ ] User verwarnen → Formular füllen → Speichern
- [ ] Dialog schließen → Erneut öffnen → Formular ist leer
- [ ] Abbrechen-Button → Formular wird zurückgesetzt

---

## Debug-Logging

### Client-Side (Browser Console)
```javascript
console.log("[Profile] Loading user data:", user);
console.log("[Profile] Submitting update with formData:", formData);
```

### Server-Side (Terminal)
```typescript
console.log("[Profile.update] User ID:", ctx.user.id);
console.log("[Profile.update] Input:", input);
console.log("[Profile.update] Update successful");
```

---

## Bekannte Probleme behoben

1. ❌ **Race Condition beim User-Laden** → ✅ Gelöst mit `useEffect([user])`
2. ❌ **Dialog behält alte Daten** → ✅ Gelöst mit `onOpenChange` Handler
3. ❌ **Page Reload nach Update** → ✅ Gelöst mit `utils.invalidate()`
4. ❌ **Fehlende Dependencies in useEffect** → ✅ Vereinfacht auf `[user]`
5. ❌ **Mutation schließt Dialog nicht** → ✅ `onSuccess` Handler hinzugefügt

---

## Datum der Fixes
**15. November 2025, 02:00 Uhr**

---

Ende der Dokumentation
