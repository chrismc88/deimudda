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
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "warned", "suspended", "banned"]).default("active").notNull(),
  warningCount: int("warningCount").default(0).notNull(),
  suspendedUntil: timestamp("suspendedUntil"),
  bannedAt: timestamp("bannedAt"),
  bannedReason: text("bannedReason"),
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
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Conversations between buyers and sellers (per listing)
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  locked: boolean("locked").default(false).notNull(),
  lockedReason: text("lockedReason"),
  lockedBy: int("lockedBy"),
  lockedAt: timestamp("lockedAt"),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages for user-to-user communication
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  listingId: int("listingId"),
  conversationId: int("conversationId"),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  moderatedAt: timestamp("moderatedAt"),
  moderatedBy: int("moderatedBy"),
  moderationReason: text("moderationReason"),
  deletedAt: timestamp("deletedAt"),
  deletedBy: int("deletedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Notifications for system events
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'message', 'offer', 'sale', 'review', 'warning', 'admin'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Admin warnings for users
 */
export const warnings = mysqlTable("warnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  message: text("message"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  removedAt: timestamp("removedAt"),
  removedBy: int("removedBy"),
});

export type Warning = typeof warnings.$inferSelect;
export type InsertWarning = typeof warnings.$inferInsert;

/**
 * Temporary user suspensions
 */
export const suspensions = mysqlTable("suspensions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  reason: text("reason").notNull(),
  suspendedAt: timestamp("suspendedAt").defaultNow().notNull(),
  suspendedUntil: timestamp("suspendedUntil").notNull(),
  active: boolean("active").default(true).notNull(),
  liftedAt: timestamp("liftedAt"),
  liftedBy: int("liftedBy"),
});

export type Suspension = typeof suspensions.$inferSelect;
export type InsertSuspension = typeof suspensions.$inferInsert;

/**
 * Permanent user bans
 */
export const bans = mysqlTable("bans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId").notNull(),
  reason: text("reason").notNull(),
  bannedAt: timestamp("bannedAt").defaultNow().notNull(),
  unbannedAt: timestamp("unbannedAt"),
  unbannedBy: int("unbannedBy"),
});

export type Ban = typeof bans.$inferSelect;
export type InsertBan = typeof bans.$inferInsert;

/**
 * User reports (listings or users)
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  reportedType: varchar("reportedType", { length: 50 }).notNull(), // 'listing', 'user'
  reportedId: int("reportedId").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'reviewed', 'resolved', 'rejected'
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Login attempts for security tracking
 */
export const loginAttempts = mysqlTable("loginAttempts", {
  id: int("id").autoincrement().primaryKey(),
  ip: varchar("ip", { length: 45 }).notNull(), // IPv4/IPv6
  userId: int("userId"),
  userAgent: text("userAgent"),
  success: boolean("success").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

/**
 * Blocked IP addresses
 */
export const blockedIPs = mysqlTable("blockedIPs", {
  id: int("id").autoincrement().primaryKey(),
  ip: varchar("ip", { length: 45 }).unique().notNull(),
  reason: text("reason").notNull(),
  blockedBy: int("blockedBy").notNull(),
  blockedAt: timestamp("blockedAt").defaultNow().notNull(),
  unblockedAt: timestamp("unblockedAt"),
  unblockedBy: int("unblockedBy"),
});

export type BlockedIP = typeof blockedIPs.$inferSelect;
export type InsertBlockedIP = typeof blockedIPs.$inferInsert;

/**
 * Admin activity logs (audit trail)
 */
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // 'warn_user', 'suspend_user', 'ban_user', etc.
  targetType: varchar("targetType", { length: 50 }).notNull(), // 'user', 'listing', 'report', 'system_setting'
  targetId: int("targetId").notNull(),
  details: text("details"), // JSON or plain text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

/**
 * System settings (dynamic configuration)
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: text("value").notNull(),
  category: varchar("category", { length: 100 }), // 'fees', 'security', 'limits', 'general'
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
