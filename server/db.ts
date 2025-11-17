import { eq, desc, and, sql, or, inArray, gte, lt, asc, isNotNull, isNull, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sellerProfiles, listings, transactions, reviews, warnings, suspensions, bans, adminLogs, systemSettings, notifications, messages, reports, loginAttempts, blockedIPs, offers, conversations, User, SellerProfile, Listing, Transaction, Offer, Notification, Conversation } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Check if user exists (for welcome notification)
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existingUser.length === 0;

    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Create welcome notification for new users
    if (isNewUser) {
      const newUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
      if (newUser.length > 0 && _createNotificationFn) {
        try {
          await _createNotificationFn(newUser[0].id, {
            type: 'system',
            title: 'Willkommen bei Deimudda!',
            message: 'Schön, dass du da bist! Entdecke jetzt Cannabis-Stecklinge und Seeds von verifizierten Züchtern.',
            link: '/browse',
          });
        } catch (e) {
          console.error('[Database] Failed to create welcome notification', e);
        }
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, updates: Partial<User>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Filter out undefined values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(filteredUpdates).length === 0) {
    return { changes: 0 }; // No updates to apply
  }

  return db.update(users).set(filteredUpdates as any).where(eq(users.id, userId));
}

// ---------------------------------------------------------------------------
// OFFER MANAGEMENT
// ---------------------------------------------------------------------------

type CreateOfferInput = {
  listingId: number;
  buyerId: number;
  sellerId: number;
  offerAmount: number;
  message?: string;
  expiresAt?: Date;
};

export async function createOffer(input: CreateOfferInput): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    // === VALIDATION: System Settings Limits ===
    
    // 1. Check minimum offer amount
    const minAmountRaw = await _getSystemSettingFn('min_offer_amount');
    const minAmount = minAmountRaw ? parseFloat(minAmountRaw) : 1.00;
    if (input.offerAmount < minAmount) {
      throw new Error(`Angebot muss mindestens ${minAmount.toFixed(2)}€ betragen`);
    }
    
    // 2. Check max offers per user (buyer)
    const maxOffersPerUserRaw = await _getSystemSettingFn('max_offers_per_user');
    const maxOffersPerUser = maxOffersPerUserRaw ? parseInt(maxOffersPerUserRaw, 10) : 20;
    const [userOfferCount] = await db
      .select({ count: count() })
      .from(offers)
      .where(
        and(
          eq(offers.buyerId, input.buyerId),
          eq(offers.status, 'pending')
        )
      );
    if ((userOfferCount?.count ?? 0) >= maxOffersPerUser) {
      throw new Error(`Sie haben bereits ${maxOffersPerUser} aktive Angebote. Bitte warten Sie, bis einige beantwortet wurden.`);
    }
    
    // 3. Check max offers per listing
    const maxOffersPerListingRaw = await _getSystemSettingFn('max_offers_per_listing');
    const maxOffersPerListing = maxOffersPerListingRaw ? parseInt(maxOffersPerListingRaw, 10) : 10;
    const [listingOfferCount] = await db
      .select({ count: count() })
      .from(offers)
      .where(
        and(
          eq(offers.listingId, input.listingId),
          eq(offers.status, 'pending')
        )
      );
    if ((listingOfferCount?.count ?? 0) >= maxOffersPerListing) {
      throw new Error(`Dieses Listing hat bereits die maximale Anzahl von ${maxOffersPerListing} aktiven Angeboten erreicht.`);
    }
    
    // === OFFER CREATION ===
    
    // Ensure dynamic expiration: if not provided, read system setting offer_expiration_days (default 7)
    if (!input.expiresAt) {
      const daysRaw = await _getSystemSettingFn('offer_expiration_days');
      const days = daysRaw ? parseInt(daysRaw, 10) : 7;
      const expires = new Date();
      expires.setDate(expires.getDate() + (isNaN(days) ? 7 : days));
      input.expiresAt = expires;
    }
    const [result] = await db
      .insert(offers)
      .values({
        listingId: input.listingId,
        buyerId: input.buyerId,
        sellerId: input.sellerId,
        offerAmount: input.offerAmount.toString(),
        message: input.message,
        expiresAt: input.expiresAt,
      })
      .$returningId();
    const offerId = result.id as number;
    
    // Notify seller of new offer
    try {
      await _createNotificationFn(input.sellerId, {
        type: 'offer',
        title: 'Neues Angebot erhalten',
        message: `Neues Angebot für Listing #${input.listingId}: ${input.offerAmount.toFixed(2)}€`,
        link: `/offers/${offerId}`,
      });
    } catch (e) {
      console.error('[Notification] createOffer notify failed', e);
    }
    
    return offerId;
  } catch (err) {
    console.error('[Database] createOffer failed', err);
    throw err;
  }
}

// --- Indirection variable for DB access (allows test overrides earlier) ---
let _getDbFn = getDb;

export async function getOffersForSeller(sellerId: number, status?: Offer['status']) {
  const db = await _getDbFn();
  if (!db) return [];
  let where: any = eq(offers.sellerId, sellerId);
  if (status) where = and(where, eq(offers.status, status));
  return db.select().from(offers).where(where).orderBy(desc(offers.createdAt));
}

export async function getOffersForBuyer(buyerId: number, status?: Offer['status']) {
  const db = await _getDbFn();
  if (!db) return [];
  let where: any = eq(offers.buyerId, buyerId);
  if (status) where = and(where, eq(offers.status, status));
  return db.select().from(offers).where(where).orderBy(desc(offers.createdAt));
}

// Paginated variants (SQL LIMIT/OFFSET for performance)
export async function getOffersForSellerPaginated(sellerId: number, page: number, pageSize: number, status?: Offer['status']) {
  const db = await _getDbFn();
  if (!db) return { items: [], total: 0 };
  let where: any = eq(offers.sellerId, sellerId);
  if (status) where = and(where, eq(offers.status, status));
  const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(offers).where(where);
  const offset = (page - 1) * pageSize;
  const items = await db.select().from(offers).where(where).orderBy(desc(offers.createdAt)).limit(pageSize).offset(offset);
  return { items, total: count };
}

export async function getOffersForBuyerPaginated(buyerId: number, page: number, pageSize: number, status?: Offer['status']) {
  const db = await _getDbFn();
  if (!db) return { items: [], total: 0 };
  let where: any = eq(offers.buyerId, buyerId);
  if (status) where = and(where, eq(offers.status, status));
  const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(offers).where(where);
  const offset = (page - 1) * pageSize;
  const items = await db.select().from(offers).where(where).orderBy(desc(offers.createdAt)).limit(pageSize).offset(offset);
  return { items, total: count };
}

export async function getOfferById(id: number) {
  const db = await _getDbFn();
  if (!db) return undefined;
  const rows = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return rows[0];
}

// Exported für Tests (Offer-Lifecycle Assertions)
export async function updateOffer(id: number, patch: Partial<Offer>) {
  const db = await _getDbFn();
  if (!db) return;
  await db.update(offers).set(patch).where(eq(offers.id, id));
}

// --- Test override indirection for offer lifecycle (allows mocking in Vitest) ---
let _getOfferById = getOfferById;
let _getListingOffer = getListing;
let _updateOfferFn = updateOffer;
let _createTransactionFn = createTransaction;
// Deferred references; assigned after declarations to avoid forward reference errors.
let _reduceListingQuantityFn: any;
let _getSystemSettingFn: any;
// _getDbFn declared earlier
let _acceptOfferFn: any = acceptOffer;
let _rejectOfferFn: any = rejectOffer;
let _createNotificationFn: any;

export function __setOfferTestOverrides(overrides: Partial<{
  getOfferById: (id: number) => Promise<any>;
  getListing: (id: number) => Promise<any>;
  updateOffer: (id: number, patch: any) => Promise<any>;
  createTransaction: (tx: any) => Promise<any>;
  reduceListingQuantity: (listingId: number, qty: number) => Promise<any>;
  getSystemSetting: (key: string) => Promise<string | null>;
  getDb: () => Promise<any>;
  acceptOffer: (id: number) => Promise<any>;
  rejectOffer: (id: number) => Promise<any>;
  createNotification: (userId: number, data: { type: string; title: string; message: string; link?: string }) => Promise<any>;
}>) {
  if (overrides.getOfferById) _getOfferById = overrides.getOfferById;
  if (overrides.getListing) _getListingOffer = overrides.getListing;
  if (overrides.updateOffer) _updateOfferFn = overrides.updateOffer;
  if (overrides.createTransaction) _createTransactionFn = overrides.createTransaction;
  if (overrides.reduceListingQuantity) _reduceListingQuantityFn = overrides.reduceListingQuantity;
  if (overrides.getSystemSetting) _getSystemSettingFn = overrides.getSystemSetting;
  if (overrides.getDb) _getDbFn = overrides.getDb;
  if (overrides.acceptOffer) _acceptOfferFn = overrides.acceptOffer;
  if (overrides.rejectOffer) _rejectOfferFn = overrides.rejectOffer;
  if (overrides.createNotification) _createNotificationFn = overrides.createNotification;
}

export async function acceptOffer(id: number) {
  // Simple in-memory lock to avoid concurrent double-accept on same listingId.
  // NOTE: This is a best-effort guard at the application layer; real consistency
  // should rely on a DB transaction or atomic UPDATE ... WHERE quantity > 0.
  const offer = await _getOfferById(id);
  if (!offer) throw new Error('Offer not found');
  const listing = await _getListingOffer(offer.listingId);
  if (!listing) throw new Error('Listing not found');
  // Acquire lock keyed by listingId
  (globalThis as any).__listingAcceptLocks ||= new Map<number, boolean>();
  const locks: Map<number, boolean> = (globalThis as any).__listingAcceptLocks;
  if (locks.get(listing.id)) {
    throw new Error('Listing no longer available');
  }
  locks.set(listing.id, true);
  try {
  if (listing.status !== 'active' || (listing.quantity || 0) < 1) {
    throw new Error('Listing no longer available');
  }
  await _updateOfferFn(id, { status: 'accepted', respondedAt: new Date() });
  const amount = parseFloat(String(offer.offerAmount));
  // Enforce minimum transaction amount from system settings
  try {
    const minTxRaw = await _getSystemSettingFn('min_transaction_amount');
    const minTx = minTxRaw ? parseFloat(minTxRaw) : 5.00;
    if (!isNaN(minTx) && amount < minTx) {
      throw new Error(`Transaktion unter Mindestbetrag ${minTx.toFixed(2)}€ nicht erlaubt`);
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Transaktion unter Mindestbetrag')) {
      // Re-throw validation error
      throw e;
    }
    console.warn('[acceptOffer] konnte min_transaction_amount Setting nicht laden, fallback genutzt');
  }
  // Enforce seller payout minimum
  try {
    const sellerMinRaw = await _getSystemSettingFn('seller_payout_minimum');
    const sellerMin = sellerMinRaw ? parseFloat(sellerMinRaw) : 1.00; // Default 1€
    if (!isNaN(sellerMin) && amount < sellerMin) {
      throw new Error(`Auszahlungsbetrag (${amount.toFixed(2)}€) unter Mindest-Auszahlung ${sellerMin.toFixed(2)}€`);
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Auszahlungsbetrag')) {
      throw e;
    }
    console.warn('[acceptOffer] seller_payout_minimum Setting nicht verfügbar, fallback genutzt');
  }
  const platformFeeFixedRaw = await _getSystemSettingFn('platform_fee_fixed');
  const paypalPercRaw = await _getSystemSettingFn('paypal_fee_percentage');
  const paypalFixedRaw = await _getSystemSettingFn('paypal_fee_fixed');
  const platformFeeFixed = platformFeeFixedRaw ? parseFloat(platformFeeFixedRaw) : 0.42;
  const paypalPerc = paypalPercRaw ? parseFloat(paypalPercRaw) / 100 : 0.0249;
  const paypalFixed = paypalFixedRaw ? parseFloat(paypalFixedRaw) : 0.49;
  const paypalFee = amount * paypalPerc + paypalFixed;
  const platformFee = platformFeeFixed; // Nur fixe Gebühr, keine Prozente
  const sellerAmount = amount;
  await _createTransactionFn({
    listingId: offer.listingId,
    buyerId: offer.buyerId,
    sellerId: offer.sellerId,
    quantity: 1,
    totalAmount: (amount + platformFee + paypalFee).toFixed(2),
    platformFee: platformFee.toFixed(2),
    sellerAmount: sellerAmount.toFixed(2),
  });
  await _reduceListingQuantityFn(listing.id, 1);
  // Notifications to both parties
  try {
    await _createNotificationFn(offer.buyerId, {
      type: 'offer',
      title: 'Angebot akzeptiert',
      message: `Dein Angebot für Listing #${offer.listingId} wurde akzeptiert.`,
      link: `/offers/${offer.id}`,
    });
    await _createNotificationFn(offer.sellerId, {
      type: 'offer',
      title: 'Verkauf bestätigt',
      message: `Du hast Angebot #${offer.id} akzeptiert. Transaktion erstellt.`,
      link: `/offers/${offer.id}`,
    });
  } catch (e) {
    console.error('[Notification] acceptOffer failed to notify', e);
  }
  } finally {
    locks.delete(listing.id);
  }
}

export async function rejectOffer(id: number) {
  await updateOffer(id, { status: 'rejected', respondedAt: new Date() });
  
  // Notify buyer of rejection
  const offer = await _getOfferById(id);
  if (offer) {
    try {
      await _createNotificationFn(offer.buyerId, {
        type: 'offer',
        title: 'Angebot abgelehnt',
        message: `Dein Angebot für Listing #${offer.listingId} wurde abgelehnt.`,
        link: `/offers/${offer.id}`,
      });
    } catch (e) {
      console.error('[Notification] rejectOffer notify failed', e);
    }
  }
}

export async function counterOffer(id: number, counterAmount: number, counterMessage?: string) {
  await _updateOfferFn(id, {
    status: 'countered',
    counterAmount: counterAmount.toString(),
    counterMessage,
    respondedAt: new Date(),
  });
  // Notify buyer of counter offer (we need offer to get buyerId)
  const offer = await _getOfferById(id);
  if (offer) {
    try {
      await _createNotificationFn(offer.buyerId, {
        type: 'offer',
        title: 'Gegengebot erhalten',
        message: `Neues Gegengebot zu Listing #${offer.listingId}: ${counterAmount.toFixed(2)}€`,
        link: `/offers/${offer.id}`,
      });
    } catch (e) {
      console.error('[Notification] counterOffer notify failed', e);
    }
  }
}

export async function respondToCounter(id: number, action: 'accept' | 'reject') {
  if (action === 'accept') {
    await _acceptOfferFn(id);
  } else {
    await _rejectOfferFn(id);
  }
  const offer = await _getOfferById(id);
  if (offer) {
    const targetUser = action === 'accept' ? offer.sellerId : offer.sellerId; // notify seller either way
    const title = action === 'accept' ? 'Gegengebot akzeptiert' : 'Gegengebot abgelehnt';
    const msg = action === 'accept'
      ? `Der Käufer hat dein Gegengebot für Listing #${offer.listingId} akzeptiert.`
      : `Der Käufer hat dein Gegengebot für Listing #${offer.listingId} abgelehnt.`;
    try {
      await _createNotificationFn(targetUser, {
        type: 'offer',
        title,
        message: msg,
        link: `/offers/${offer.id}`,
      });
    } catch (e) {
      console.error('[Notification] respondToCounter notify failed', e);
    }
  }
}

export async function expireOffers(now: Date = new Date()) {
  const db = await _getDbFn();
  if (!db) return;
  // Expire offers still pending or countered
  await db
    .update(offers)
    .set({ status: 'expired' })
    .where(
      and(
        lt(offers.expiresAt, now),
        inArray(offers.status, ['pending', 'countered'])
      )
    );
}

export async function getPendingActionsForUser(userId: number) {
  const db = await getDb();
  if (!db) return { seller: [], buyer: [] };
  const sellerPending = await db
    .select()
    .from(offers)
    .where(and(eq(offers.sellerId, userId), eq(offers.status, 'pending')))
    .orderBy(desc(offers.createdAt));
  const buyerCountered = await db
    .select()
    .from(offers)
    .where(and(eq(offers.buyerId, userId), eq(offers.status, 'countered')))
    .orderBy(desc(offers.respondedAt));
  return { seller: sellerPending, buyer: buyerCountered };
}


// Seller Profile functions
export async function createSellerProfile(userId: number, shopName: string, description?: string, location?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sellerProfiles).values({
    userId,
    shopName,
    description,
    location,
  });

  return result;
}

export async function getSellerProfile(userId: number): Promise<(SellerProfile & { profileImageUrl?: string | null }) | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  // Join with users table to get profileImageUrl
  const result = await db.select({
    id: sellerProfiles.id,
    userId: sellerProfiles.userId,
    shopName: sellerProfiles.shopName,
    description: sellerProfiles.description,
    location: sellerProfiles.location,
    profileImageUrl: users.profileImageUrl, // Get from users table
    stripeAccountId: sellerProfiles.stripeAccountId,
    verificationStatus: sellerProfiles.verificationStatus,
    rating: sellerProfiles.rating,
    totalReviews: sellerProfiles.totalReviews,
    createdAt: sellerProfiles.createdAt,
    updatedAt: sellerProfiles.updatedAt,
  })
    .from(sellerProfiles)
    .leftJoin(users, eq(sellerProfiles.userId, users.id))
    .where(eq(sellerProfiles.userId, userId))
    .limit(1);
  
  console.log('[DEBUG] getSellerProfile result:', JSON.stringify(result[0], null, 2));
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSellerProfile(userId: number, updates: Partial<SellerProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Filter out undefined values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(filteredUpdates).length === 0) {
    return { changes: 0 }; // No updates to apply
  }

  return db.update(sellerProfiles).set(filteredUpdates as any).where(eq(sellerProfiles.userId, userId));
}

// Listing functions
export async function createListing(sellerId: number, listing: {
  type: "cutting" | "seed";
  strain: string;
  description?: string;
  quantity: number;
  priceType: "fixed" | "offer";
  fixedPrice?: number | string;
  offerMinPrice?: number | string;
  acceptsOffers?: boolean;
  imageUrl?: string;
  images?: string;
  shippingVerified?: boolean;
  shippingPickup?: boolean;
  // Additional optional fields
  genetics?: "sativa" | "indica" | "hybrid";
  seedBank?: string;
  growMethod?: "hydro" | "bio" | "soil";
  seedType?: "feminized" | "regular" | "autoflower";
  thcContent?: string;
  cbdContent?: string;
  floweringTime?: string;
  yieldInfo?: string;
  flavorProfile?: string;
  origin?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validate max_listing_price
  const maxPriceRaw = await _getSystemSettingFn('max_listing_price');
  const maxPrice = maxPriceRaw ? parseFloat(maxPriceRaw) : 10000;
  const priceToCheck = listing.fixedPrice ? parseFloat(String(listing.fixedPrice)) : (listing.offerMinPrice ? parseFloat(String(listing.offerMinPrice)) : 0);
  if (priceToCheck > maxPrice) {
    throw new Error(`Preis ${priceToCheck.toFixed(2)}€ überschreitet Maximum ${maxPrice.toFixed(2)}€`);
  }

  // Validate min_seller_rating
  const minRatingRaw = await _getSystemSettingFn('min_seller_rating');
  const minRating = minRatingRaw ? parseFloat(minRatingRaw) : 0;
  if (minRating > 0) {
    const sellerProfile = await getSellerProfile(sellerId);
    const rating = sellerProfile?.rating ? parseFloat(String(sellerProfile.rating)) : 0;
    if (rating < minRating) {
      throw new Error(`Mindestbewertung ${minRating} erforderlich (aktuell: ${rating.toFixed(1)})`);
    }
  }

  const acceptsOffers = listing.acceptsOffers ?? listing.priceType === "offer";

  return db.insert(listings).values({
    sellerId,
    type: listing.type,
    strain: listing.strain,
    description: listing.description,
    quantity: listing.quantity,
    shippingVerified: listing.shippingVerified !== undefined ? listing.shippingVerified : true,
    shippingPickup: listing.shippingPickup !== undefined ? listing.shippingPickup : false,
    priceType: listing.priceType,
    fixedPrice: listing.fixedPrice ? String(listing.fixedPrice) : undefined,
    offerMinPrice: listing.offerMinPrice ? String(listing.offerMinPrice) : undefined,
    acceptsOffers,
    imageUrl: listing.imageUrl,
    images: listing.images,
    status: "active", // Automatically set to active
    // Additional optional fields
    genetics: listing.genetics,
    seedBank: listing.seedBank,
    growMethod: listing.growMethod,
    seedType: listing.seedType,
    thcContent: listing.thcContent,
    cbdContent: listing.cbdContent,
    floweringTime: listing.floweringTime,
    yieldInfo: listing.yieldInfo,
    flavorProfile: listing.flavorProfile,
    origin: listing.origin,
  });
}

export async function getListing(id: number): Promise<Listing | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSellerListings(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(listings)
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(listings.createdAt));
}

// Alias for getUserListings (backward compatibility)
export async function getUserListings(userId: number) {
  return getSellerListings(userId);
}

// Get all listings for admin purposes
export async function getAllListings() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(listings)
    .orderBy(desc(listings.createdAt));
}

export async function getActiveListings(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(listings)
    .where(eq(listings.status, "active"))
    .orderBy(desc(listings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateListing(id: number, updates: Partial<Listing>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(listings).set(updates).where(eq(listings.id, id));
}

// Transaction functions
export async function createTransaction(transaction: {
  listingId: number;
  buyerId: number;
  sellerId: number;
  quantity: number;
  totalAmount: number | string;
  platformFee: number | string;
  sellerAmount: number | string;
  stripeChargeId?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(transactions).values({
    listingId: transaction.listingId,
    buyerId: transaction.buyerId,
    sellerId: transaction.sellerId,
    quantity: transaction.quantity,
    totalAmount: String(transaction.totalAmount),
    platformFee: String(transaction.platformFee),
    sellerAmount: String(transaction.sellerAmount),
    stripeChargeId: transaction.stripeChargeId,
  });
}

export async function getTransaction(id: number): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBuyerTransactions(buyerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(transactions)
    .where(eq(transactions.buyerId, buyerId))
    .orderBy(desc(transactions.createdAt));
}

export async function getSellerTransactions(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(transactions)
    .where(eq(transactions.sellerId, sellerId))
    .orderBy(desc(transactions.createdAt));
}

export async function updateTransaction(id: number, updates: Partial<Transaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(transactions).set(updates).where(eq(transactions.id, id));
}

// Get all transactions (admin function)
export async function getAllTransactions() {
  const db = await getDb();
  if (!db) return [];

  try {
    const allTransactions = await db.select().from(transactions)
      .orderBy(desc(transactions.createdAt));
    return allTransactions;
  } catch (error) {
    console.error("[Database] Failed to get all transactions:", error);
    return [];
  }
}

// Review functions
export async function createReview(review: {
  transactionId: number;
  sellerId: number;
  buyerId: number;
  rating: number;
  comment?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(reviews).values({
    transactionId: review.transactionId,
    sellerId: review.sellerId,
    buyerId: review.buyerId,
    rating: review.rating,
    comment: review.comment,
  });
}

export async function getReviewsBySellerId(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
    buyerName: users.nickname,
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.buyerId, users.id))
    .where(eq(reviews.sellerId, sellerId))
    .orderBy(desc(reviews.createdAt));

  return result;
}

export async function getReviewByTransactionAndBuyer(transactionId: number, buyerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(reviews)
    .where(and(eq(reviews.transactionId, transactionId), eq(reviews.buyerId, buyerId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getTransactionById(id: number): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSellerRating(sellerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate average rating
  const allReviews = await db.select().from(reviews).where(eq(reviews.sellerId, sellerId));
  
  if (allReviews.length === 0) {
    await db.update(sellerProfiles)
      .set({ rating: "0", totalReviews: 0 })
      .where(eq(sellerProfiles.userId, sellerId));
    return;
  }

  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = (totalRating / allReviews.length).toFixed(2);

  await db.update(sellerProfiles)
    .set({ rating: averageRating, totalReviews: allReviews.length })
    .where(eq(sellerProfiles.userId, sellerId));
}

// ===== ADMIN FUNCTIONS =====

// Get admin dashboard statistics
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get total transactions and revenue
    const allTransactions = await db.select().from(transactions);
    const totalTransactions = allTransactions.length;
    const totalRevenue = allTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount as any), 0);
    const platformFees = allTransactions.reduce((sum, t) => sum + parseFloat(t.platformFee as any), 0);
    
    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactionsToday = allTransactions.filter(t => new Date(t.createdAt) >= today).length;

    // Get total users and sellers
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const totalSellers = allUsers.filter(u => u.isSellerActive).length;
    const warnedUsers = allUsers.filter(u => u.status === 'warned').length;
    const suspendedUsers = allUsers.filter(u => u.status === 'suspended').length;

    // Get listings
    const allListings = await db.select().from(listings);
    const totalListings = allListings.length;
    const activeListings = allListings.filter(l => l.status === 'active').length;

    return {
      totalRevenue,
      platformFees,
      totalTransactions,
      transactionsToday,
      totalUsers,
      totalSellers,
      warnedUsers,
      suspendedUsers,
      activeListings,
      totalListings,
      pendingReports: 0, // TODO: Implement when reports are added
    };
  } catch (error) {
    console.error("[Database] Failed to get admin stats:", error);
    return null;
  }
}

// Get all users for admin management
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  try {
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error) {
    console.error("[Database] Failed to get all users:", error);
    return [];
  }
}

// Warn user (admin function)
export async function warnUser(userId: number, adminId: number, reason: string, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    console.log("[Database] Warning user:", { userId, adminId, reason, message });
    
    // Update user status and warning count
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      throw new Error(`User ${userId} not found`);
    }

    const newWarningCount = (user[0].warningCount || 0) + 1;
    await db.update(users)
      .set({ 
        status: 'warned' as any,
        warningCount: newWarningCount,
      })
      .where(eq(users.id, userId));
    
    console.log("[Database] User warned successfully, count:", newWarningCount);
    
    // Insert into warnings table
    await db.insert(warnings).values({
      userId,
      adminId,
      reason,
      message,
      active: true,
      createdAt: new Date(),
    });
    console.log("[Database] Warning record created in warnings table");

    // Create notification for user
    await createNotification(userId, {
      type: 'warning',
      title: 'You have received a warning',
      message: `Reason: ${reason}. ${message}`,
      link: '/profile',
    });
    console.log("[Database] Warning notification created");
    
    // Log admin action
    await createAdminLog({
      adminId,
      action: 'warn_user',
      targetType: 'user',
      targetId: userId,
      details: JSON.stringify({ reason, message, warningCount: newWarningCount }),
    });
  } catch (error) {
    console.error("[Database] Failed to warn user:", error);
    throw error;
  }
}

// Suspend user temporarily (admin function)
export async function suspendUser(userId: number, adminId: number, reason: string, days: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + days);

    // Update user status
    await db.update(users)
      .set({ 
        status: 'suspended',
        suspendedUntil,
      })
      .where(eq(users.id, userId));

    console.log("[Database] User suspended until:", suspendedUntil);
    
    // Insert into suspensions table
    await db.insert(suspensions).values({
      userId,
      adminId,
      reason,
      suspendedAt: new Date(),
      suspendedUntil,
      active: true,
    });
    console.log("[Database] Suspension record created in suspensions table");

    // Create notification for user
    await createNotification(userId, {
      type: 'admin',
      title: 'Your account has been suspended',
      message: `Reason: ${reason}. Suspended until ${suspendedUntil.toLocaleDateString('de-DE')}`,
      link: '/profile',
    });
    console.log("[Database] Suspension notification created");
    
    // Log admin action
    await createAdminLog({
      adminId,
      action: 'suspend_user',
      targetType: 'user',
      targetId: userId,
      details: JSON.stringify({ reason, days, suspendedUntil: suspendedUntil.toISOString() }),
    });
  } catch (error) {
    console.error("[Database] Failed to suspend user:", error);
    throw error;
  }
}

// Ban user permanently (admin function)
export async function banUser(userId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Update user status
    await db.update(users)
      .set({ 
        status: 'banned',
        bannedAt: new Date(),
        bannedReason: reason,
      })
      .where(eq(users.id, userId));

    console.log("[Database] User banned successfully");
    
    // Insert into bans table
    await db.insert(bans).values({
      userId,
      adminId,
      reason,
      bannedAt: new Date(),
    });
    console.log("[Database] Ban record created in bans table");

    // Create notification for user
    await createNotification(userId, {
      type: 'admin',
      title: 'Your account has been permanently banned',
      message: `Reason: ${reason}. Contact support if you believe this is an error.`,
      link: '/profile',
    });
    console.log("[Database] Ban notification created");
    
    // Log admin action
    await createAdminLog({
      adminId,
      action: 'ban_user',
      targetType: 'user',
      targetId: userId,
      details: JSON.stringify({ reason }),
    });
  } catch (error) {
    console.error("[Database] Failed to ban user:", error);
    throw error;
  }
}

// Unsuspend user (admin function)
export async function unsuspendUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(users)
      .set({ 
        status: 'active',
        suspendedUntil: null,
      })
      .where(eq(users.id, userId));

    console.log("[Database] User unsuspended successfully");
  } catch (error) {
    console.error("[Database] Failed to unsuspend user:", error);
    throw error;
  }
}

// Unban user (admin function)
export async function unbanUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(users)
      .set({ 
        status: 'active',
        bannedAt: null,
        bannedReason: null,
      })
      .where(eq(users.id, userId));

    console.log("[Database] User unbanned successfully");
  } catch (error) {
    console.error("[Database] Failed to unban user:", error);
    throw error;
  }
}

// Promote user to admin (super admin function)
export async function promoteToAdmin(userId: number, adminId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, userId));

    console.log("[Database] User promoted to admin successfully");
    
    // Log admin action if adminId provided
    if (adminId) {
      await createAdminLog({
        adminId,
        action: 'promote_to_admin',
        targetType: 'user',
        targetId: userId,
        details: JSON.stringify({ newRole: 'admin' }),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to promote user:", error);
    throw error;
  }
}

// Demote admin to user (super admin function)
export async function demoteFromAdmin(userId: number, adminId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(users)
      .set({ role: 'user' })
      .where(eq(users.id, userId));

    console.log("[Database] Admin demoted to user successfully");
    
    // Log admin action if adminId provided
    if (adminId) {
      await createAdminLog({
        adminId,
        action: 'demote_from_admin',
        targetType: 'user',
        targetId: userId,
        details: JSON.stringify({ newRole: 'user' }),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to demote admin:", error);
    throw error;
  }
}

// Get all admins (super admin function)
export async function getAllAdmins() {
  const db = await getDb();
  if (!db) return [];

  try {
    const admins = await db.select().from(users)
      .where(or(eq(users.role, 'admin'), eq(users.role, 'super_admin')));
    return admins;
  } catch (error) {
    console.error("[Database] Failed to get all admins:", error);
    return [];
  }
}

// ===== PLACEHOLDER FUNCTIONS FOR INCOMPLETE FEATURES =====
// These will be implemented when the full schema is complete

export async function removeWarning(warningId: number, adminId: number) {
  console.log("[Database] removeWarning not yet implemented (warnings table missing)");
  return { success: false, message: "Feature not yet implemented" };
}

export async function getUserWarnings(userId: number) {
  console.log("[Database] getUserWarnings not yet implemented (warnings table missing)");
  return [];
}

// ===== ADMIN LOGS =====

export async function createAdminLog(data: {
  adminId: number;
  action: string;
  targetType: string;
  targetId: number;
  details?: string;
}) {
  const db = await _getDbFn();
  if (!db) return;
  
  try {
    await db.insert(adminLogs).values({
      adminId: data.adminId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      details: data.details,
    });
  } catch (error) {
    console.error("[Database] Error creating admin log:", error);
  }
}

export async function getAdminLogs(filters?: {
  adminId?: number;
  action?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await _getDbFn();
  if (!db) return [];
  
  try {
    let query = db
      .select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        adminName: users.name,
        action: adminLogs.action,
        targetType: adminLogs.targetType,
        targetId: adminLogs.targetId,
        details: adminLogs.details,
        createdAt: adminLogs.createdAt,
      })
      .from(adminLogs)
      .leftJoin(users, eq(adminLogs.adminId, users.id))
      .$dynamic();
    
    // Apply filters
    const conditions = [];
    if (filters?.adminId) conditions.push(eq(adminLogs.adminId, filters.adminId));
    if (filters?.action) conditions.push(eq(adminLogs.action, filters.action));
    if (filters?.targetType) conditions.push(eq(adminLogs.targetType, filters.targetType));
    if (filters?.startDate) conditions.push(gte(adminLogs.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lt(adminLogs.createdAt, filters.endDate));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const logs = await query.orderBy(desc(adminLogs.createdAt)).limit(filters?.limit || 100);
    
    return logs;
  } catch (error) {
    console.error("[Database] Error fetching admin logs:", error);
    return [];
  }
}

export async function getAdminLogsByTarget(targetType: string, targetId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const logs = await db
      .select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        adminName: users.name,
        action: adminLogs.action,
        targetType: adminLogs.targetType,
        targetId: adminLogs.targetId,
        details: adminLogs.details,
        createdAt: adminLogs.createdAt,
      })
      .from(adminLogs)
      .leftJoin(users, eq(adminLogs.adminId, users.id))
      .where(and(eq(adminLogs.targetType, targetType), eq(adminLogs.targetId, targetId)))
      .orderBy(desc(adminLogs.createdAt));
    
    return logs;
  } catch (error) {
    console.error("[Database] Error fetching target logs:", error);
    return [];
  }
}

export async function blockListing(listingId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(listings)
      .set({ status: 'blocked' as any })
      .where(eq(listings.id, listingId));

    console.log("[Database] Listing blocked successfully");
  } catch (error) {
    console.error("[Database] Failed to block listing:", error);
    throw error;
  }
}

export async function unblockListing(listingId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(listings)
      .set({ status: 'active' as any })
      .where(eq(listings.id, listingId));

    console.log("[Database] Listing unblocked successfully");
  } catch (error) {
    console.error("[Database] Failed to unblock listing:", error);
    throw error;
  }
}

export async function deleteListing(listingId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get listing details before marking as deleted
    const listing = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
    
    await db.update(listings)
      .set({ status: 'deleted' as any })
      .where(eq(listings.id, listingId));

    console.log("[Database] Listing marked as deleted");
    
    // Log admin action
    await createAdminLog({
      adminId,
      action: 'delete_listing',
      targetType: 'listing',
      targetId: listingId,
      details: JSON.stringify({ 
        reason, 
        listingData: listing[0] ? { strain: listing[0].strain, sellerId: listing[0].sellerId } : null 
      }),
    });
  } catch (error) {
    console.error("[Database] Failed to delete listing:", error);
    throw error;
  }
}

export async function getAllReports() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const allReports = await db
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        reporterName: users.name,
        reportedType: reports.reportedType,
        reportedId: reports.reportedId,
        reason: reports.reason,
        message: reports.message,
        status: reports.status,
        reviewedBy: reports.reviewedBy,
        reviewedAt: reports.reviewedAt,
        resolution: reports.resolution,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt));
    
    return allReports;
  } catch (error) {
    console.error("[Database] Error fetching reports:", error);
    return [];
  }
}

export async function getReportById(reportId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const report = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
    
    return report[0] || null;
  } catch (error) {
    console.error("[Database] Error fetching report:", error);
    return null;
  }
}

export async function createReport(data: {
  reporterId: number;
  reportedType: 'listing' | 'user';
  reportedId: number;
  reason: string;
  message?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  try {
    await db.insert(reports).values({
      reporterId: data.reporterId,
      reportedType: data.reportedType,
      reportedId: data.reportedId,
      reason: data.reason,
      message: data.message,
      status: 'pending',
    });
    return { success: true };
  } catch (error) {
    console.error("[Database] Error creating report:", error);
    throw error;
  }
}

export async function updateReportStatus(
  reportId: number, 
  adminId: number, 
  status: string,
  resolution?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  try {
    await db.update(reports).set({
      status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      resolution: resolution || null,
    }).where(eq(reports.id, reportId));
    
    // Log admin action
    await createAdminLog({
      adminId,
      action: 'update_report_status',
      targetType: 'report',
      targetId: reportId,
      details: JSON.stringify({ status, resolution }),
    });
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Error updating report status:", error);
    throw error;
  }
}

export async function deleteReport(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  try {
    await db.delete(reports).where(eq(reports.id, reportId));
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Error deleting report:", error);
    throw error;
  }
}

export async function getReportsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const reportsUser = await db
      .select()
      .from(reports)
      .where(
        or(
          and(eq(reports.reportedType, 'user'), eq(reports.reportedId, userId)),
          eq(reports.reporterId, userId)
        )
      )
      .orderBy(desc(reports.createdAt));

    return reportsUser;
  } catch (error) {
    console.error("[Database] Error fetching user reports:", error);
    return [];
  }
}

export async function getReportsByListing(listingId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const reportsListing = await db
      .select()
      .from(reports)
      .where(and(eq(reports.reportedType, 'listing'), eq(reports.reportedId, listingId)))
      .orderBy(desc(reports.createdAt));

    return reportsListing;
  } catch (error) {
    console.error("[Database] Error fetching listing reports:", error);
    return [];
  }
}

// ===== SYSTEM SETTINGS =====

export async function getSystemSettings() {
  const db = await getDb();
  if (!db) return [];

  try {
    const settings = await db.select().from(systemSettings);
    return settings;
  } catch (error) {
    console.error("[Database] Failed to get system settings:", error);
    return [];
  }
}

type SystemSettingMeta = {
  category: string;
  description: string | null;
};

const SYSTEM_SETTING_DEFAULTS: Record<string, SystemSettingMeta> = {
  email_notifications_enabled: {
    category: "notifications",
    description: "Global toggle for email notifications",
  },
  email_verification_required: {
    category: "verification",
    description: "Require email verification before listings go live",
  },
  enable_ratings: {
    category: "features",
    description: "Enable the rating and review system",
  },
  site_description: {
    category: "branding",
    description: "Long form site description for SEO/snippets",
  },
  admin_email: {
    category: "general",
    description: "Primary contact email for admins",
  },
  image_max_size_mb: {
    category: "limits",
    description: "Maximum image size in megabytes",
  },
  ip_block_duration_hours: {
    category: "security",
    description: "Automatic unblock time for blocked IPs in hours",
  },
  listing_auto_expire_days: {
    category: "listings",
    description: "Auto expire listings after this many inactive days",
  },
  login_lockout_duration_minutes: {
    category: "security",
    description: "Lockout duration after too many failed logins",
  },
  maintenance_mode: {
    category: "general",
    description: "Toggle to take the platform into maintenance mode",
  },
  max_active_listings_per_user: {
    category: "limits",
    description: "Maximum active listings a user can have",
  },
  max_listing_images: {
    category: "limits",
    description: "Maximum number of images per listing",
  },
  max_listing_price: {
    category: "commerce",
    description: "Maximum listing price in EUR",
  },
  max_login_attempts: {
    category: "security",
    description: "Maximum failed login attempts before blocking",
  },
  max_login_attempts_per_ip: {
    category: "security",
    description: "Maximum login attempts per IP in the rate limit window",
  },
  max_login_attempts_per_user: {
    category: "security",
    description: "Maximum login attempts per user in the rate limit window",
  },
  max_message_length: {
    category: "limits",
    description: "Maximum message length in characters",
  },
  max_offers_per_listing: {
    category: "limits",
    description: "Maximum active offers allowed per listing",
  },
  max_offers_per_user: {
    category: "limits",
    description: "Maximum active offers a user can have as buyer",
  },
  min_age_requirement: {
    category: "general",
    description: "Minimum age required to use the platform",
  },
  min_offer_amount: {
    category: "limits",
    description: "Minimum offer amount in EUR",
  },
  min_listing_price: {
    category: "limits",
    description: "Minimum listing price in EUR",
  },
  min_seller_rating: {
    category: "commerce",
    description: "Minimum seller rating required to sell",
  },
  min_transaction_amount: {
    category: "payments",
    description: "Minimum transaction amount in EUR",
  },
  min_transactions_for_rating: {
    category: "features",
    description: "Transactions required before a user can rate",
  },
  notification_retention_days: {
    category: "notifications",
    description: "Days to retain read notifications",
  },
  paypal_fee_fixed: {
    category: "fees",
    description: "Fixed PayPal fee per transaction in EUR",
  },
  paypal_fee_percentage: {
    category: "fees",
    description: "PayPal fee percentage",
  },
  platform_currency: {
    category: "payments",
    description: "Platform currency (EUR, USD, etc.)",
  },
  platform_fee_fixed: {
    category: "fees",
    description: "Fixed platform fee per transaction in EUR",
  },
  refund_window_days: {
    category: "payments",
    description: "Buyer refund window in days",
  },
  registration_enabled: {
    category: "general",
    description: "Allow new user registrations",
  },
  require_listing_approval: {
    category: "verification",
    description: "Require admin approval before listings go live",
  },
  require_seller_profile_for_offers: {
    category: "verification",
    description: "Require seller profile completion to accept offers",
  },
  review_window_days: {
    category: "general",
    description: "Days after a transaction to leave a review",
  },
  seller_payout_minimum: {
    category: "payments",
    description: "Minimum seller balance required for payout",
  },
  session_lifetime_days: {
    category: "security",
    description: "Session cookie lifetime in days",
  },
  site_name: {
    category: "branding",
    description: "Site name used in notifications and emails",
  },
  suspicious_activity_threshold: {
    category: "security",
    description: "Actions per minute that trigger a security review",
  },
  suspension_max_days: {
    category: "security",
    description: "Maximum suspension duration in days",
  },
  warning_threshold: {
    category: "security",
    description: "Warnings required before automatic suspension",
  },
  message_rate_limit_per_hour: {
    category: "limits",
    description: "Maximum messages a user can send per hour",
  },
};

const SYSTEM_SETTING_ALIASES: Record<string, string> = {
  max_images_per_listing: "max_listing_images",
  max_image_size_mb: "image_max_size_mb",
};

const REVERSE_SETTING_ALIASES: Record<string, string[]> = Object.entries(
  SYSTEM_SETTING_ALIASES,
).reduce((acc, [legacy, canonical]) => {
  (acc[canonical] ??= []).push(legacy);
  return acc;
}, {} as Record<string, string[]>);

const resolveSettingKey = (key: string) => SYSTEM_SETTING_ALIASES[key] ?? key;

const getAliasCandidates = (canonicalKey: string) =>
  REVERSE_SETTING_ALIASES[canonicalKey] ?? [];

const getSystemSettingDefaults = (key: string): SystemSettingMeta => {
  return SYSTEM_SETTING_DEFAULTS[key] ?? { category: "general", description: null };
};

export async function updateSystemSetting(key: string, value: string, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const canonicalKey = resolveSettingKey(key);
    const metadata = getSystemSettingDefaults(canonicalKey);

    await db.insert(systemSettings)
      .values({
        key: canonicalKey,
        value,
        category: metadata.category,
        description: metadata.description,
        updatedBy: adminId,
      })
      .onDuplicateKeyUpdate({
        set: {
          value,
          updatedAt: new Date(),
          updatedBy: adminId,
        },
      });

    console.log("[Database] System setting upserted:", canonicalKey, value);
  } catch (error) {
    console.error("[Database] Failed to update system setting:", error);
    throw error;
  }
}

// ===== NOTIFICATIONS PLACEHOLDER =====

export async function getMyNotifications(userId: number) {
  const db = await _getDbFn();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(100); // cap
    console.log('[Database] getMyNotifications rows:', rows.length);
    // Map to shared Notification shape expected by client (adjust naming if needed)
    return rows.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt,
      read: n.isRead,
      actionUrl: n.link ?? undefined,
    }));
  } catch (error) {
    console.error('[Database] getMyNotifications failed', error);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await _getDbFn();
  if (!db) return 0;
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    // Verbose: console.log('[Database] getUnreadNotificationCount for user', userId, '=>', count);
    return count || 0;
  } catch (error) {
    console.error("[Database] Failed to get unread notification count", error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await _getDbFn();
  if (!db) return { success: false };
  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('[Database] markNotificationAsRead failed', error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await _getDbFn();
  if (!db) return { success: false };
  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    return { success: true };
  } catch (error) {
    console.error('[Database] markAllNotificationsAsRead failed', error);
    return { success: false };
  }
}

export async function deleteNotification(notificationId: number, userId: number) {
  const db = await _getDbFn();
  if (!db) return { success: false };
  try {
    await db.delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('[Database] deleteNotification failed', error);
    return { success: false };
  }
}

// ===== CHAT / MESSAGING =====

async function getConversationRecord(conversationId: number) {
  const db = await getDb();
  if (!db) return null;
  const record = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  return record[0] || null;
}

async function getConversationRecordByParticipants(listingId: number, buyerId: number, sellerId: number) {
  const db = await getDb();
  if (!db) return null;
  const record = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.listingId, listingId),
        eq(conversations.buyerId, buyerId),
        eq(conversations.sellerId, sellerId)
      )
    )
    .limit(1);
  return record[0] || null;
}

async function mapConversationDetails(db: Awaited<ReturnType<typeof getDb>>, conversation: Conversation) {
  if (!db) return conversation;
  const [listing] = await db
    .select({ strain: listings.strain, imageUrl: listings.imageUrl })
    .from(listings)
    .where(eq(listings.id, conversation.listingId))
    .limit(1);

  const [buyer] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, conversation.buyerId))
    .limit(1);

  const [seller] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, conversation.sellerId))
    .limit(1);

  return {
    ...conversation,
    listingStrain: listing?.strain || "Unbekannt",
    listingImage: listing?.imageUrl,
    buyerName: buyer?.name || "Käufer",
    sellerName: seller?.name || "Verkäufer",
  };
}

export async function getOrCreateConversation(listingId: number, buyerId: number, sellerId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  if (buyerId === sellerId) {
    throw new Error("Konversation mit sich selbst ist nicht möglich");
  }

  const listing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing.length) {
    throw new Error("Listing not found");
  }

  if (listing[0].sellerId !== sellerId) {
    throw new Error("Seller mismatch for listing");
  }

  let conversation = await getConversationRecordByParticipants(listingId, buyerId, sellerId);
  if (!conversation) {
    const [newConversation] = await db
      .insert(conversations)
      .values({
        listingId,
        buyerId,
        sellerId,
        lastMessageAt: new Date(),
      })
      .$returningId();

    conversation = await getConversationRecord(newConversation.id);
  }

  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  return await mapConversationDetails(db, conversation);
}

export async function getConversationDetails(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const conversation = await getConversationRecord(conversationId);
  if (!conversation) {
    return null;
  }
  if (![conversation.buyerId, conversation.sellerId].includes(userId)) {
    throw new Error("Kein Zugriff auf diese Konversation");
  }

  return await mapConversationDetails(db, conversation);
}

export async function sendMessage(conversationId: number, senderId: number, message: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const conversation = await getConversationRecord(conversationId);
  if (!conversation) {
    throw new Error("Konversation nicht gefunden");
  }

  if (![conversation.buyerId, conversation.sellerId].includes(senderId)) {
    throw new Error("Sie sind kein Teilnehmer dieser Konversation");
  }

  if (conversation.locked) {
    throw new Error("Diese Konversation wurde von Moderatoren gesperrt");
  }

  const receiverId = senderId === conversation.buyerId ? conversation.sellerId : conversation.buyerId;

  const [newMessage] = await db
    .insert(messages)
    .values({
      senderId,
      receiverId,
      listingId: conversation.listingId,
      conversationId,
      content: message,
      isRead: false,
    })
    .$returningId();

  const inserted = await db
    .select()
    .from(messages)
    .where(eq(messages.id, newMessage.id))
    .limit(1)
    .then(rows => rows[0]);

  if (inserted) {
    await db
      .update(conversations)
      .set({
        lastMessageAt: inserted.createdAt,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));
  }

  return inserted;
}

export async function getConversationMessages(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    return [] as Array<typeof messages.$inferSelect>;
  }

  const conversation = await getConversationRecord(conversationId);
  if (!conversation) {
    return [];
  }

  if (![conversation.buyerId, conversation.sellerId].includes(userId)) {
    throw new Error("Kein Zugriff auf diese Konversation");
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        isNull(messages.deletedAt)
      )
    )
    .orderBy(asc(messages.createdAt));

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.receiverId, userId),
        isNull(messages.deletedAt),
        eq(messages.isRead, false)
      )
    );

  return msgs;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [] as unknown as any[];

  const baseConversations = await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.buyerId, userId),
        eq(conversations.sellerId, userId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt));

  const enriched = await Promise.all(
    baseConversations.map(async (conversation) => {
      const details = await mapConversationDetails(db, conversation);
      const unreadCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversation.id),
            eq(messages.receiverId, userId),
            eq(messages.isRead, false),
            isNull(messages.deletedAt)
          )
        )
        .then(rows => rows[0]?.count || 0);

      const lastMessage = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversation.id),
            isNull(messages.deletedAt)
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(1)
        .then(rows => rows[0] || null);

      return {
        ...details,
        unreadCount,
        lastMessage,
      };
    })
  );

  return enriched;
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false),
          isNull(messages.deletedAt)
        )
      );
    return count || 0;
  } catch (error) {
    console.error('[Database] Failed to get unread message count', error);
    return 0;
  }
}

export async function adminGetConversations(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  const baseConversations = await db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit);

  return Promise.all(
    baseConversations.map(async (conversation) => {
      const details = await mapConversationDetails(db, conversation);
      const messageCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .then(rows => rows[0]?.count || 0);
      const unreadCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversation.id),
            eq(messages.isRead, false),
            isNull(messages.deletedAt)
          )
        )
        .then(rows => rows[0]?.count || 0);

      return {
        ...details,
        messageCount,
        unreadCount,
      };
    })
  );
}

export async function adminGetConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  const conversation = await getConversationRecord(conversationId);
  if (!conversation) return [];

  const msgs = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      content: messages.content,
      createdAt: messages.createdAt,
      isRead: messages.isRead,
      deletedAt: messages.deletedAt,
      deletedBy: messages.deletedBy,
      moderatedAt: messages.moderatedAt,
      moderatedBy: messages.moderatedBy,
      moderationReason: messages.moderationReason,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const senderIds = Array.from(new Set(msgs.map((msg) => msg.senderId).filter(Boolean)));
  const receiversIds = Array.from(new Set(msgs.map((msg) => msg.receiverId).filter(Boolean)));
  const userIds = Array.from(new Set([...senderIds, ...receiversIds]));

  const participants = userIds.length
    ? await db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .where(inArray(users.id, userIds))
    : [];

  const participantMap = new Map(participants.map((p) => [p.id, p.name || `User ${p.id}`]));

  return msgs.map((msg) => ({
    ...msg,
    senderName: participantMap.get(msg.senderId) || "Unbekannt",
    receiverName: participantMap.get(msg.receiverId) || "Unbekannt",
  }));
}

export async function adminLockConversation(conversationId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) return { success: false };

  await db
    .update(conversations)
    .set({
      locked: true,
      lockedReason: reason,
      lockedBy: adminId,
      lockedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  await createAdminLog({
    adminId,
    action: 'lock_conversation',
    targetType: 'conversation',
    targetId: conversationId,
    details: reason,
  });

  return { success: true };
}

export async function adminUnlockConversation(conversationId: number, adminId: number) {
  const db = await getDb();
  if (!db) return { success: false };

  await db
    .update(conversations)
    .set({
      locked: false,
      lockedReason: null,
      lockedBy: null,
      lockedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  await createAdminLog({
    adminId,
    action: 'unlock_conversation',
    targetType: 'conversation',
    targetId: conversationId,
  });

  return { success: true };
}

export async function adminDeleteMessage(messageId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) return { success: false };

  await db
    .update(messages)
    .set({
      deletedAt: new Date(),
      deletedBy: adminId,
      moderatedAt: new Date(),
      moderatedBy: adminId,
      moderationReason: reason,
    })
    .where(eq(messages.id, messageId));

  await createAdminLog({
    adminId,
    action: 'delete_message',
    targetType: 'message',
    targetId: messageId,
    details: reason,
  });

  return { success: true };
}

export async function adminRestoreMessage(messageId: number, adminId: number) {
  const db = await getDb();
  if (!db) return { success: false };

  await db
    .update(messages)
    .set({
      deletedAt: null,
      deletedBy: null,
      moderatedAt: null,
      moderatedBy: null,
      moderationReason: null,
    })
    .where(eq(messages.id, messageId));

  await createAdminLog({
    adminId,
    action: 'restore_message',
    targetType: 'message',
    targetId: messageId,
  });

  return { success: true };
}

export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get listing:", error);
    return null;
  }
}

export async function reduceListingQuantity(listingId: number, quantity: number) {
  // Delegate to override if provided (for tests). Initialization sets override to this function.
  if (_reduceListingQuantityFn && _reduceListingQuantityFn !== reduceListingQuantity) {
    return _reduceListingQuantityFn(listingId, quantity);
  }
  const db = await _getDbFn();
  if (!db) return { success: false, reason: 'db_unavailable' } as const;
  const current = await _getListingOffer(listingId);
  if (!current) return { success: false, reason: 'not_found' } as const;
  // Attempt atomic conditional update (quantity must be >= requested)
  try {
    const affected = await db.update(listings)
      .set({
        quantity: sql`(${listings.quantity} - ${quantity})`,
        status: sql`CASE WHEN (${listings.quantity} - ${quantity}) <= 0 THEN 'sold' ELSE ${listings.status} END`,
      })
      .where(and(eq(listings.id, listingId), gte(listings.quantity, quantity)));
    // If update builder does not expose affected rows, re-select to verify
  } catch (e) {
    // Fallback to non-atomic path on error (e.g., expression unsupported)
    const remaining = (current.quantity || 0) - quantity;
    const newQty = remaining < 0 ? 0 : remaining;
    const newStatus = newQty <= 0 ? 'sold' : current.status;
    try {
      await db.update(listings)
        .set({ quantity: newQty, status: newStatus })
        .where(eq(listings.id, listingId));
    } catch (err) {
      console.error('[Database] reduceListingQuantity failed', err);
      return { success: false, reason: 'update_failed' } as const;
    }
  }
  // Re-select to get remaining
  const updated = await _getListingOffer(listingId);
  const updatedQty = updated?.quantity || 0;
  return { success: true, remaining: updatedQty } as const;
}

// --- Notifications helper ---
export async function createNotification(userId: number, data: { type: string; title: string; message: string; link?: string }) {
  const db = await _getDbFn();
  if (!db) return;
  try {
    await db.insert(notifications).values({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    });
  } catch (e) {
    console.error('[Database] createNotification failed', e);
  }
}

// Initialize deferred lifecycle references (executed once on module load)
(function initLifecycleRefs(){
  _reduceListingQuantityFn = reduceListingQuantity;
  _getSystemSettingFn = getSystemSetting;
  _createNotificationFn = createNotification;
})();

// ===== MISSING CORE FUNCTIONS =====

// Delete account (GDPR compliance)
export async function deleteAccount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // In a real implementation, this would delete all user data
    // For now, just mark as banned (deleted status doesn't exist in enum)
    await db.update(users)
      .set({ 
        status: 'banned',
        email: null,
        name: 'Deleted User',
      })
      .where(eq(users.id, userId));

    console.log("[Database] Account marked as deleted (banned)");
  } catch (error) {
    console.error("[Database] Failed to delete account:", error);
    throw error;
  }
}

// Get single system setting by key
export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const canonicalKey = resolveSettingKey(key);

    const fetchSetting = async (candidateKey: string) => {
      const result = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, candidateKey))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    };

    const direct = await fetchSetting(canonicalKey);
    if (direct) {
      return direct.value;
    }

    const fallbackKeys = Array.from(
      new Set([
        ...(canonicalKey !== key ? [key] : []),
        ...getAliasCandidates(canonicalKey),
      ]),
    );

    for (const fallbackKey of fallbackKeys) {
      const fallback = await fetchSetting(fallbackKey);
      if (fallback) {
        const metadata = getSystemSettingDefaults(canonicalKey);
        await db
          .insert(systemSettings)
          .values({
            key: canonicalKey,
            value: fallback.value,
            category: metadata.category,
            description: metadata.description,
            updatedBy: fallback.updatedBy ?? null,
          })
          .onDuplicateKeyUpdate({
            set: {
              value: fallback.value,
              updatedAt: new Date(),
              updatedBy: fallback.updatedBy ?? null,
            },
          });
        return fallback.value;
      }
    }

    return null;
  } catch (error) {
    console.error("[Database] Failed to get system setting:", error);
    return null;
  }
}

/**
 * Get session lifetime in milliseconds from system settings
 * @returns Session lifetime in MS (default: 14 days = 1209600000 ms)
 */
export async function getSessionLifetimeMs(): Promise<number> {
  const daysRaw = await getSystemSetting('session_lifetime_days');
  const days = daysRaw ? parseInt(daysRaw, 10) : 14;
  const validDays = isNaN(days) || days < 1 ? 14 : days;
  return validDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
}

// ===== SECURITY PLACEHOLDERS (continued) =====

export async function getIPsWithMostAttempts(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select({
        ip: loginAttempts.ip,
        attemptCount: sql<number>`COUNT(*)`
      })
      .from(loginAttempts)
      .where(eq(loginAttempts.success, false))
      .groupBy(loginAttempts.ip)
      .orderBy(desc(sql`COUNT(*)`), desc(loginAttempts.timestamp))
      .limit(limit);

    console.log(`[Database] Found ${result.length} IPs with most failed attempts`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get IPs with most attempts:", error);
    throw error;
  }
}

export async function getBlockedIPs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select({
        id: blockedIPs.id,
        ipAddress: blockedIPs.ip,
        reason: blockedIPs.reason,
        blockedAt: blockedIPs.blockedAt,
        blockedBy: blockedIPs.blockedBy,
        unblockedAt: blockedIPs.unblockedAt,
        unblockedBy: blockedIPs.unblockedBy,
        isActive: sql<boolean>`${blockedIPs.unblockedAt} IS NULL`
      })
      .from(blockedIPs)
      .orderBy(desc(blockedIPs.blockedAt));

    // Join mit users table für blockedBy Namen
    const enriched = await Promise.all(result.map(async (blocked) => {
      const admin = await db.select({ name: users.name })
        .from(users)
        .where(eq(users.id, blocked.blockedBy))
        .limit(1);
      
      return {
        ...blocked,
        blockedByName: admin[0]?.name || "Unknown"
      };
    }));

    console.log(`[Database] Found ${enriched.length} blocked IPs (${enriched.filter(b => b.isActive).length} active)`);
    return enriched;
  } catch (error) {
    console.error("[Database] Failed to get blocked IPs:", error);
    throw error;
  }
}

export async function blockIP(ipAddress: string, reason: string, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Check if IP already actively blocked
    const existing = await db
      .select()
      .from(blockedIPs)
      .where(and(
        eq(blockedIPs.ip, ipAddress),
        isNull(blockedIPs.unblockedAt)
      ))
      .limit(1);

    if (existing.length > 0) {
      console.log(`[Database] IP ${ipAddress} is already actively blocked`);
      return { success: false, message: "IP already blocked" };
    }

    // Delete any old entries for this IP (unblocked or not)
    await db.delete(blockedIPs).where(eq(blockedIPs.ip, ipAddress));

    // Insert new block
    await db.insert(blockedIPs).values({
      ip: ipAddress,
      reason,
      blockedBy: adminId,
      blockedAt: new Date(),
    });

    // Log admin action
    await createAdminLog({
      adminId,
      action: "block_ip",
      targetType: "ip",
      targetId: 0, // IPs haben keine numerische ID als Target
      details: JSON.stringify({ ipAddress, reason }),
    });

    console.log(`[Database] IP ${ipAddress} blocked successfully by admin ${adminId}`);
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to block IP:", error);
    throw error;
  }
}

export async function unblockIP(ipAddress: string, adminId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Find active block
    const existing = await db
      .select()
      .from(blockedIPs)
      .where(and(
        eq(blockedIPs.ip, ipAddress),
        isNull(blockedIPs.unblockedAt)
      ))
      .limit(1);

    if (existing.length === 0) {
      console.log(`[Database] IP ${ipAddress} is not currently blocked`);
      return { success: false, message: "IP not currently blocked" };
    }

    // Update block with unblock info
    await db
      .update(blockedIPs)
      .set({
        unblockedAt: new Date(),
        unblockedBy: adminId || null,
      })
      .where(and(
        eq(blockedIPs.ip, ipAddress),
        isNull(blockedIPs.unblockedAt)
      ));

    // Log admin action if adminId provided
    if (adminId) {
      await createAdminLog({
        adminId,
        action: "unblock_ip",
        targetType: "ip",
        targetId: 0,
        details: JSON.stringify({ ipAddress }),
      });
    }

    console.log(`[Database] IP ${ipAddress} unblocked successfully`);
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to unblock IP:", error);
    throw error;
  }
}

// Check if IP is currently blocked
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false; // Fail open if DB unavailable

  try {
    const result = await db
      .select()
      .from(blockedIPs)
      .where(and(
        eq(blockedIPs.ip, ipAddress),
        isNull(blockedIPs.unblockedAt)
      ))
      .limit(1);

    if (result.length === 0) return false;

    // Auto-unblock nach Ablauf der Dauer (ip_block_duration_hours)
    const hoursRaw = await getSystemSetting('ip_block_duration_hours');
    const hours = hoursRaw ? parseInt(hoursRaw, 10) : 6; // Default 6h
    if (hours > 0) {
      const block = result[0] as any;
      const blockedAt = block.blockedAt as Date;
      const expiresAt = new Date(blockedAt.getTime() + hours * 60 * 60 * 1000);
      if (new Date() > expiresAt) {
        await unblockIP(ipAddress); // Silent auto-unblock
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("[Database] Failed to check if IP is blocked:", error);
    return false; // Fail open
  }
}

// Track login attempt
export async function trackLoginAttempt(
  ip: string,
  userId: number | null,
  userAgent: string | undefined,
  success: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track login attempt: database not available");
    return;
  }

  try {
    await db.insert(loginAttempts).values({
      ip,
      userId,
      userAgent,
      success,
      timestamp: new Date(),
    });

    console.log(`[Database] Login attempt tracked: ${ip} - ${success ? 'success' : 'failed'}`);

    const parseSettingInt = async (settingKey: string, fallback: number) => {
      const raw = await getSystemSetting(settingKey);
      if (!raw) return fallback;
      const parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const baseMaxRaw = await getSystemSetting('max_login_attempts');
    const baseMax = baseMaxRaw ? parseInt(baseMaxRaw, 10) : 5;
    const ipThreshold = await parseSettingInt('max_login_attempts_per_ip', baseMax);
    const userThreshold = await parseSettingInt('max_login_attempts_per_user', 0);
    const suspiciousThreshold = await parseSettingInt('suspicious_activity_threshold', 0);

    // Auto-block after threshold
    if (!success) {
      const recentAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.ip, ip),
            eq(loginAttempts.success, false),
            sql`${loginAttempts.timestamp} > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
          )
        );

      if (recentAttempts.length >= ipThreshold) {
        console.log(`[Database] Auto-blocking IP ${ip} after ${recentAttempts.length} failed attempts (threshold ${ipThreshold})`);
        await blockIP(ip, `Auto-blocked: ${recentAttempts.length} failed login attempts in 15 minutes`, 1);
      }

      if (userId && userThreshold > 0) {
        const userAttempts = await db
          .select()
          .from(loginAttempts)
          .where(
            and(
              eq(loginAttempts.userId, userId),
              eq(loginAttempts.success, false),
              sql`${loginAttempts.timestamp} > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`
            )
          );

        if (userAttempts.length >= userThreshold) {
          await createAdminLog({
            adminId: 1,
            action: "user_login_threshold",
            targetType: "user",
            targetId: userId,
            details: JSON.stringify({
              attempts: userAttempts.length,
              threshold: userThreshold,
            }),
          });
        }
      }
    }

    if (suspiciousThreshold > 0) {
      const rapidAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.ip, ip),
            sql`${loginAttempts.timestamp} > DATE_SUB(NOW(), INTERVAL 1 MINUTE)`
          )
        );

      if (rapidAttempts.length >= suspiciousThreshold) {
        console.warn(`[Security] IP ${ip} exceeded suspicious activity threshold (${rapidAttempts.length}/${suspiciousThreshold})`);
        await blockIP(
          ip,
          `Auto-blocked: ${rapidAttempts.length} actions in 60 seconds (threshold ${suspiciousThreshold})`,
          1
        );
      }
    }
  } catch (error) {
    console.error("[Database] Failed to track login attempt:", error);
  }
}

// Cleanup alter Benachrichtigungen nach retention
export async function cleanupOldNotifications(retentionDays: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    if (retentionDays <= 0) return 0;
    const deleted = await db.execute(sql`DELETE FROM notifications WHERE createdAt < DATE_SUB(NOW(), INTERVAL ${retentionDays} DAY)`);
    // deleted.affectedRows may be available depending on adapter; fallback 0
    // @ts-ignore
    return deleted?.affectedRows || 0;
  } catch (error) {
    console.error('[Database] Failed to cleanup old notifications:', error);
    return 0;
  }
}

// Get security logs (real data from DB)
export async function getSecurityLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get security logs: database not available");
    return [];
  }

  try {
    const logs: Array<{
      id: string;
      type: "ip_block" | "ip_unblock" | "login_fail" | "login_success";
      ipAddress: string;
      details: string;
      timestamp: Date;
      adminId: number | null;
      adminName: string | null;
    }> = [];

    // Get blocked IPs
    const blocks = await db
      .select({
        id: blockedIPs.id,
        ip: blockedIPs.ip,
        reason: blockedIPs.reason,
        blockedAt: blockedIPs.blockedAt,
        blockedBy: blockedIPs.blockedBy,
        unblockedAt: blockedIPs.unblockedAt,
        unblockedBy: blockedIPs.unblockedBy,
      })
      .from(blockedIPs)
      .orderBy(desc(blockedIPs.blockedAt))
      .limit(limit);

    for (const block of blocks) {
      // Get admin name for blocker
      const blocker = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, block.blockedBy))
        .limit(1);

      logs.push({
        id: `block-${block.id}`,
        type: "ip_block",
        ipAddress: block.ip,
        details: block.reason,
        timestamp: block.blockedAt,
        adminId: block.blockedBy,
        adminName: blocker[0]?.name || "Unknown Admin",
      });

      // If unblocked, add unblock log
      if (block.unblockedAt && block.unblockedBy) {
        const unblocker = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, block.unblockedBy))
          .limit(1);

        logs.push({
          id: `unblock-${block.id}`,
          type: "ip_unblock",
          ipAddress: block.ip,
          details: `Unblocked by ${unblocker[0]?.name || "Unknown Admin"}`,
          timestamp: block.unblockedAt,
          adminId: block.unblockedBy,
          adminName: unblocker[0]?.name || "Unknown Admin",
        });
      }
    }

    // Get recent login attempts (failed + successful)
    const attempts = await db
      .select({
        id: loginAttempts.id,
        ip: loginAttempts.ip,
        userId: loginAttempts.userId,
        success: loginAttempts.success,
        timestamp: loginAttempts.timestamp,
        userAgent: loginAttempts.userAgent,
      })
      .from(loginAttempts)
      .orderBy(desc(loginAttempts.timestamp))
      .limit(limit);

    for (const attempt of attempts) {
      let userName: string | null = null;
      if (attempt.userId) {
        const user = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, attempt.userId))
          .limit(1);
        userName = user[0]?.name || null;
      }

      logs.push({
        id: `login-${attempt.id}`,
        type: attempt.success ? "login_success" : "login_fail",
        ipAddress: attempt.ip,
        details: userName
          ? `${attempt.success ? "Success" : "Failed"} login: ${userName} (${attempt.userAgent?.substring(0, 50) || "Unknown agent"})`
          : `${attempt.success ? "Success" : "Failed"} login attempt (${attempt.userAgent?.substring(0, 50) || "Unknown agent"})`,
        timestamp: attempt.timestamp,
        adminId: attempt.userId,
        adminName: userName,
      });
    }

    // Sort all logs by timestamp descending
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log(`[Database] Retrieved ${logs.length} security log entries`);
    return logs.slice(0, limit);
  } catch (error) {
    console.error("[Database] Failed to get security logs:", error);
    // Return empty array on error instead of throwing
    return [];
  }
}
