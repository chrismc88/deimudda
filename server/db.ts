import { eq, desc, and, sql, or, inArray, gte, lt, asc, isNotNull, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sellerProfiles, listings, transactions, reviews, warnings, suspensions, bans, adminLogs, systemSettings, notifications, messages, reports, loginAttempts, blockedIPs, offers, User, SellerProfile, Listing, Transaction, Offer, Notification } from "../drizzle/schema";
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
  const platformFeeFixedRaw = await _getSystemSettingFn('platform_fee_fixed');
  const paypalPercRaw = await _getSystemSettingFn('paypal_fee_percentage');
  const paypalFixedRaw = await _getSystemSettingFn('paypal_fee_fixed');
  const platformFeeFixed = platformFeeFixedRaw ? parseFloat(platformFeeFixedRaw) : 0.42;
  const paypalPerc = paypalPercRaw ? parseFloat(paypalPercRaw) / 100 : 0.0249;
  const paypalFixed = paypalFixedRaw ? parseFloat(paypalFixedRaw) : 0.49;
  const paypalFee = amount * paypalPerc + paypalFixed;
  const platformFee = platformFeeFixed;
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

export async function updateSystemSetting(key: string, value: string, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(systemSettings)
      .set({ 
        value,
        updatedAt: new Date(),
        updatedBy: adminId,
      })
      .where(eq(systemSettings.key, key));

    console.log("[Database] System setting updated:", key, value);
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

// ===== CHAT/MESSAGES PLACEHOLDER =====

export async function getOrCreateConversation(listingId: number, buyerId: number, sellerId: number) {
  // Since we don't have a conversations table, we just return the listing info
  // The conversation is implicit based on messages between buyer/seller for a listing
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const listing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  
  if (!listing.length) {
    throw new Error("Listing not found");
  }

  return {
    listingId,
    buyerId,
    sellerId,
    listing: listing[0],
  };
}

export async function sendMessage(conversationId: number, senderId: number, message: string) {
  // conversationId is actually the listingId in our simplified model
  // We need to determine the receiverId based on who the sender is
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const listing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, conversationId))
    .limit(1);

  if (!listing.length) {
    throw new Error("Listing not found");
  }

  const receiverId = senderId === listing[0].sellerId 
    ? listing[0].sellerId // If sender is seller, this needs buyer - but we don't know buyer yet
    : listing[0].sellerId; // If sender is buyer, receiver is seller

  const [newMessage] = await db
    .insert(messages)
    .values({
      senderId,
      receiverId,
      listingId: conversationId,
      content: message,
      isRead: false,
    })
    .$returningId();

  return await db
    .select()
    .from(messages)
    .where(eq(messages.id, newMessage.id))
    .limit(1)
    .then(rows => rows[0]);
}

export async function getConversationMessages(conversationId: number, userId: number) {
  // conversationId is the listingId
  // Get all messages for this listing where user is sender or receiver
  const db = await getDb();
  if (!db) {
    return [] as Array<typeof messages.$inferSelect>;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.listingId, conversationId),
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
    )
    .orderBy(asc(messages.createdAt));

  // Mark messages as read where user is receiver
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.listingId, conversationId),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      )
    );

  return msgs;
}

export async function getUserConversations(userId: number) {
  // Get unique listings where user has sent or received messages
  const db = await getDb();
  if (!db) return [] as unknown as any[];

  // 1) Aggregate by listingId and get lastMessageAt only (no computed columns)
  const userMessages = await db
    .select({
      listingId: messages.listingId,
      lastMessageAt: sql<Date>`MAX(${messages.createdAt})`.as('lastMessageAt'),
    })
    .from(messages)
    .where(
      and(
        isNotNull(messages.listingId),
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
    )
    .groupBy(messages.listingId)
    .orderBy(desc(sql`lastMessageAt`));

  // Get listing and user details for each conversation
  const conversations = await Promise.all(
    userMessages.map(async (msg) => {
      // 2) Determine otherUserId based on the most recent message in this conversation
      const [latest] = await db
        .select({ senderId: messages.senderId, receiverId: messages.receiverId })
        .from(messages)
        .where(
          and(
            eq(messages.listingId, msg.listingId!),
            or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const computedOtherUserId = latest
        ? (latest.senderId === userId ? latest.receiverId : latest.senderId)
        : userId;

      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, msg.listingId!))
        .limit(1);

      const [otherUser] = await db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, computedOtherUserId))
        .limit(1);

      const unreadCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.listingId, msg.listingId!),
            eq(messages.receiverId, userId),
            eq(messages.isRead, false)
          )
        )
        .then(rows => rows[0]?.count || 0);

      return {
        id: msg.listingId,
        listingId: msg.listingId,
        listingStrain: listing?.strain || "Unknown",
        listingImage: listing?.imageUrl,
        buyerId: listing?.sellerId === userId ? computedOtherUserId : userId,
        sellerId: listing?.sellerId || 0,
        buyerName: listing?.sellerId === userId ? otherUser?.name || "Unknown" : "Sie",
        sellerName: listing?.sellerId === userId ? "Sie" : otherUser?.name || "Unknown",
        lastMessageAt: msg.lastMessageAt,
        unreadCount,
      };
    })
  );

  return conversations;
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    // Verbose: console.log('[Database] getUnreadMessageCount for user', userId, '=>', count);
    return count || 0;
  } catch (error) {
    console.error('[Database] Failed to get unread message count', error);
    return 0;
  }
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
    const setting = await db.select().from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    
    return setting.length > 0 ? setting[0].value : null;
  } catch (error) {
    console.error("[Database] Failed to get system setting:", error);
    return null;
  }
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

    return result.length > 0;
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

      if (recentAttempts.length >= 5) {
        console.log(`[Database] Auto-blocking IP ${ip} after ${recentAttempts.length} failed attempts`);
        await blockIP(ip, `Auto-blocked: ${recentAttempts.length} failed login attempts in 15 minutes`, 1);
      }
    }
  } catch (error) {
    console.error("[Database] Failed to track login attempt:", error);
  }
}

// Get security logs (real data from DB) - TODO: Fix JOIN issues
export async function getSecurityLogs(limit: number = 50) {
  // Temporarily return mock data due to Drizzle JOIN type issues
  return [
    {
      id: "1",
      type: "ip_block" as const,
      ipAddress: "192.168.1.100",
      details: "Test block",
      timestamp: new Date(),
      adminId: 1,
      adminName: "Admin",
    },
  ];
}
