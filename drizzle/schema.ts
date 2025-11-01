import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  nickname: varchar("nickname", { length: 100 }),
  location: varchar("location", { length: 255 }),
  profileImageUrl: varchar("profileImageUrl", { length: 500 }),
  isSellerActive: boolean("isSellerActive").default(false).notNull(),
  ageVerified: boolean("ageVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Seller profiles for users who want to sell cuttings/seeds
 */
export const sellerProfiles = mysqlTable("sellerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  shopName: varchar("shopName", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  profileImageUrl: varchar("profileImageUrl", { length: 500 }),
  stripeAccountId: varchar("stripeAccountId", { length: 255 }),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: int("totalReviews").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = typeof sellerProfiles.$inferInsert;

/**
 * Listings for cuttings and seeds
 */
export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  type: mysqlEnum("type", ["cutting", "seed"]).notNull(),
  strain: varchar("strain", { length: 255 }).notNull(),
  description: text("description"),
  quantity: int("quantity").notNull(),
  priceType: mysqlEnum("priceType", ["fixed", "offer"]).notNull(),
  fixedPrice: decimal("fixedPrice", { precision: 10, scale: 2 }),
  offerMinPrice: decimal("offerMinPrice", { precision: 10, scale: 2 }),
  acceptsOffers: boolean("acceptsOffers").default(false).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  images: text("images"),
  shippingVerified: boolean("shippingVerified").default(true).notNull(),
  shippingPickup: boolean("shippingPickup").default(false).notNull(),
  status: mysqlEnum("status", ["active", "sold", "ended", "draft"]).default("draft").notNull(),
  // Additional optional fields for professional listings
  genetics: mysqlEnum("genetics", ["sativa", "indica", "hybrid"]),
  seedBank: varchar("seedBank", { length: 255 }),
  growMethod: mysqlEnum("growMethod", ["hydro", "bio", "soil"]),
  seedType: mysqlEnum("seedType", ["feminized", "regular", "autoflower"]),
  thcContent: varchar("thcContent", { length: 50 }),
  cbdContent: varchar("cbdContent", { length: 50 }),
  floweringTime: varchar("floweringTime", { length: 100 }),
  yieldInfo: varchar("yieldInfo", { length: 255 }),
  flavorProfile: varchar("flavorProfile", { length: 500 }),
  origin: varchar("origin", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

/**
 * Price offers for negotiable listings
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  offerAmount: decimal("offerAmount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "countered", "expired"]).default("pending").notNull(),
  counterAmount: decimal("counterAmount", { precision: 10, scale: 2 }),
  counterMessage: text("counterMessage"),
  expiresAt: timestamp("expiresAt"),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Transactions for completed sales
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  quantity: int("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(),
  sellerAmount: decimal("sellerAmount", { precision: 10, scale: 2 }).notNull(),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  ageVerificationConfirmed: boolean("ageVerificationConfirmed").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Reviews for sellers
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  sellerId: int("sellerId").notNull(),
  buyerId: int("buyerId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;// Admin-System Tabellen

// Warnings
export const warnings = mysqlTable("warnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  reason: mysqlEnum("reason", ['fraud', 'tos_violation', 'illegal_products', 'harassment', 'fake_listing', 'non_delivery', 'other']).notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Warning = typeof warnings.$inferSelect;
export type InsertWarning = typeof warnings.$inferInsert;

// Suspensions
export const suspensions = mysqlTable("suspensions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  reason: text("reason").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Suspension = typeof suspensions.$inferSelect;
export type InsertSuspension = typeof suspensions.$inferInsert;

// Bans
export const bans = mysqlTable("bans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Ban = typeof bans.$inferSelect;
export type InsertBan = typeof bans.$inferInsert;

// Admin Logs
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("targetType", { length: 50 }),
  targetId: int("targetId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

// System Settings
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 255 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"),
});
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// Notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Conversations
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id").notNull(),
  user2Id: int("user2Id").notNull(),
  listingId: int("listingId"),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Reports
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  reportedUserId: int("reportedUserId"),
  reportedListingId: int("reportedListingId"),
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ['pending', 'reviewing', 'resolved', 'dismissed']).default('pending').notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// Login Attempts
export const loginAttempts = mysqlTable("loginAttempts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  success: boolean("success").notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

// Blocked IPs
export const blockedIPs = mysqlTable("blockedIPs", {
  id: int("id").autoincrement().primaryKey(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull().unique(),
  reason: text("reason"),
  blockedBy: int("blockedBy"),
  blockedAt: timestamp("blockedAt").defaultNow().notNull(),
});
export type BlockedIP = typeof blockedIPs.$inferSelect;
export type InsertBlockedIP = typeof blockedIPs.$inferInsert;
