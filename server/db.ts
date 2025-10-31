import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sellerProfiles, listings, transactions, bids, reviews, User, SellerProfile, Listing, Transaction } from "../drizzle/schema";
import { ENV } from './_core/env';

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
  priceType: "fixed" | "auction";
  fixedPrice?: number | string;
  auctionStartPrice?: number | string;
  auctionEndTime?: Date;
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
    auctionStartPrice: listing.auctionStartPrice ? String(listing.auctionStartPrice) : undefined,
    auctionEndTime: listing.auctionEndTime,
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

