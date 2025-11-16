import { COOKIE_NAME } from "@shared/const";
import { SHOP_NAME_MIN, SHOP_NAME_MAX, DESCRIPTION_MAX, LOCATION_MAX, SHOP_NAME_REGEX } from "../shared/validation";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, superAdminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { listings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User Profile routes
  profile: router({
    update: protectedProcedure
      .input(z.object({
        nickname: z.string().optional(),
        location: z.string().optional(),
        profileImageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log("[Profile.update] User ID:", ctx.user.id);
        console.log("[Profile.update] Input:", input);
        await db.updateUserProfile(ctx.user.id, input);
        console.log("[Profile.update] Update successful");
        return { success: true };
      }),

    activateSeller: protectedProcedure
      .input(z.object({
        shopName: z.string().trim().min(SHOP_NAME_MIN).max(SHOP_NAME_MAX).regex(SHOP_NAME_REGEX),
        description: z.string().trim().max(DESCRIPTION_MAX).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is already a seller
        if (ctx.user.isSellerActive) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a seller",
          });
        }

        // Check if seller profile already exists (from previous activation)
        const existingProfile = await db.getSellerProfile(ctx.user.id);
        
        if (existingProfile) {
          // Update existing profile instead of creating new one
          await db.updateSellerProfile(ctx.user.id, {
            shopName: input.shopName,
            description: input.description,
          });
        } else {
          // Create new seller profile
          await db.createSellerProfile(
            ctx.user.id,
            input.shopName,
            input.description,
            ctx.user.location || undefined
          );
        }

        // Activate seller mode
        await db.updateUserProfile(ctx.user.id, { isSellerActive: true });

        return { success: true };
      }),

    deactivateSeller: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user.isSellerActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not a seller",
          });
        }

        await db.updateUserProfile(ctx.user.id, { isSellerActive: false });
        return { success: true };
      }),

    deleteAccount: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Delete all user data (GDPR compliance)
        await db.deleteAccount(ctx.user.id);
        
        // Clear session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        
        return { success: true };
      }),
  }),

  // Seller Profile routes
  seller: router({
    // Get or create seller profile for current user
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getSellerProfile(ctx.user.id);
      return profile;
    }),

    // Create a new seller profile
    createProfile: protectedProcedure
      .input(z.object({
        shopName: z.string().trim().min(SHOP_NAME_MIN).max(SHOP_NAME_MAX).regex(SHOP_NAME_REGEX),
        description: z.string().trim().max(DESCRIPTION_MAX).optional(),
        location: z.string().trim().max(LOCATION_MAX).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already has a seller profile
        const existing = await db.getSellerProfile(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already has a seller profile",
          });
        }

        // Create seller profile
        await db.createSellerProfile(
          ctx.user.id,
          input.shopName,
          input.description,
          input.location
        );

        return { success: true };
      }),

    // Update seller profile
    updateProfile: protectedProcedure
      .input(z.object({
        shopName: z.string().trim().min(SHOP_NAME_MIN).max(SHOP_NAME_MAX).regex(SHOP_NAME_REGEX).optional(),
        description: z.string().trim().max(DESCRIPTION_MAX).optional(),
        location: z.string().trim().max(LOCATION_MAX).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getSellerProfile(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Seller profile not found",
          });
        }

        await db.updateSellerProfile(ctx.user.id, input);
        return { success: true };
      }),

    // Get seller profile by ID (public)
    getProfileById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const profile = await db.getSellerProfile(input);
        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Seller profile not found",
          });
        }
        return profile;
      }),
  }),

  // Listing routes
  listing: router({
    // Create a new listing
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["cutting", "seed"]),
        strain: z.string().min(1).max(255),
        description: z.string().optional(),
        quantity: z.number().int().positive(),
        priceType: z.enum(["fixed", "offer"]),
        fixedPrice: z.number().positive().optional(),
        offerMinPrice: z.number().positive().optional(),
        imageUrl: z.string().url().optional(),
        images: z.array(z.string().url()).optional(),
        shippingVerified: z.boolean().default(true),
        shippingPickup: z.boolean().default(false),
        acceptsOffers: z.boolean().default(false),
        genetics: z.enum(["sativa", "indica", "hybrid"]).optional(),
        seedBank: z.string().max(255).optional(),
        growMethod: z.enum(["hydro", "bio", "soil"]).optional(),
        seedType: z.enum(["feminized", "regular", "autoflower"]).optional(),
        thcContent: z.string().max(50).optional(),
        cbdContent: z.string().max(50).optional(),
        floweringTime: z.string().max(100).optional(),
        yieldInfo: z.string().max(255).optional(),
        flavorProfile: z.string().max(500).optional(),
        origin: z.string().max(255).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is a seller
        const profile = await db.getSellerProfile(ctx.user.id);
        if (!profile) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User must have a seller profile to create listings",
          });
        }

        await db.createListing(ctx.user.id, {
          type: input.type,
          strain: input.strain,
          description: input.description,
          quantity: input.quantity,
          priceType: input.priceType,
          fixedPrice: input.fixedPrice?.toString(),
          offerMinPrice: input.offerMinPrice?.toString(),
          imageUrl: input.imageUrl,
          images: input.images ? JSON.stringify(input.images) : undefined,
          shippingVerified: input.shippingVerified,
          shippingPickup: input.shippingPickup,
          acceptsOffers: input.acceptsOffers,
          genetics: input.genetics,
          seedBank: input.seedBank,
          growMethod: input.growMethod,
          seedType: input.seedType,
          thcContent: input.thcContent,
          cbdContent: input.cbdContent,
          floweringTime: input.floweringTime,
          yieldInfo: input.yieldInfo,
          flavorProfile: input.flavorProfile,
          origin: input.origin,
        });

        return { success: true };
      }),

    // Get listing by ID
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const listing = await db.getListing(input);
        return listing;
      }),

    // Get active listings (browse)
    getActive: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input;
        const listings = await db.getActiveListings(limit, offset);
        return listings;
      }),

    // Get my listings (seller)
    getMine: protectedProcedure
      .query(async ({ ctx }) => {
        const listings = await db.getUserListings(ctx.user.id);
        return listings;
      }),

    // Get listings by seller ID
    getBySellerID: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const listings = await db.getSellerListings(input);
        return listings;
      }),

    // Get all listings (admin only)
    getAll: adminProcedure
      .query(async () => {
        const listings = await db.getAllListings();
        return listings;
      }),

    // Update listing
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        strain: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        quantity: z.number().int().positive().optional(),
        fixedPrice: z.number().positive().optional(),
        offerMinPrice: z.number().positive().optional(),
        imageUrl: z.string().url().optional(),
        images: z.array(z.string().url()).optional(),
        shippingVerified: z.boolean().optional(),
        shippingPickup: z.boolean().optional(),
        acceptsOffers: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // Verify ownership
        const listing = await db.getListing(id);
        if (!listing || listing.sellerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own listings",
          });
        }

        // Convert images array to string and numbers to string for DB storage
        const processedUpdates = {
          ...updates,
          images: updates.images ? JSON.stringify(updates.images) : undefined,
          fixedPrice: updates.fixedPrice?.toString(),
          offerMinPrice: updates.offerMinPrice?.toString(),
        };

        await db.updateListing(id, processedUpdates);
        return { success: true };
      }),

    // Delete listing
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const listing = await db.getListing(input);
        if (!listing || listing.sellerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own listings",
          });
        }

        await db.updateListing(input, { status: "ended" as any });
        return { success: true };
      }),
  }),

  // Transaction routes
  transaction: router({
    // Get buyer transactions
    getBuyerTransactions: protectedProcedure
      .query(async ({ ctx }) => {
        const transactions = await db.getBuyerTransactions(ctx.user.id);
        return transactions;
      }),

    // Get seller transactions
    getSellerTransactions: protectedProcedure
      .query(async ({ ctx }) => {
        const transactions = await db.getSellerTransactions(ctx.user.id);
        return transactions;
      }),
  }),

  // Review routes
  review: router({  
    // Create a new review
    create: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
        sellerId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already reviewed this transaction
        const existingReview = await db.getReviewByTransactionAndBuyer(input.transactionId, ctx.user.id);
        if (existingReview) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Sie haben diese Transaktion bereits bewertet",
          });
        }

        await db.createReview({
          transactionId: input.transactionId,
          sellerId: input.sellerId,
          buyerId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        });

        return { success: true };
      }),

    // Get reviews by seller ID
    getBySellerId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const reviews = await db.getReviewsBySellerId(input);
        return reviews;
      }),
  }),

  // Upload routes
  upload: router({
    image: protectedProcedure
      .input(z.object({
        filename: z.string(),
        data: z.string(), // base64 encoded image
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Mock implementation for now
        const mockUrl = `https://mock.deimudda.space/uploads/${Date.now()}-${input.filename}`;
        console.log(`[Upload] Mock upload: ${mockUrl}`);
        return { url: mockUrl };
      }),
  }),

  // Admin routes
  admin: router({
    // Get dashboard stats
    getStats: adminProcedure.query(async () => {
      const stats = await db.getAdminStats();
      return stats;
    }),

    // Get all users
    getAllUsers: adminProcedure.query(async () => {
      const users = await db.getAllUsers();
      return users;
    }),

    // Get all transactions
    getAllTransactions: adminProcedure.query(async () => {
      const transactions = await db.getAllTransactions();
      return transactions;
    }),

    // Warn user
    warnUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.enum(['fraud', 'tos_violation', 'illegal_products', 'harassment', 'fake_listing', 'non_delivery', 'other']),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.warnUser(input.userId, ctx.user.id, input.reason, input.message);
        return { success: true };
      }),

    // Suspend user
    suspendUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string(),
        days: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.suspendUser(input.userId, ctx.user.id, input.reason, input.days);
        return { success: true };
      }),

    // Ban user
    banUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.banUser(input.userId, ctx.user.id, input.reason);
        return { success: true };
      }),

    // Unsuspend user
    unsuspendUser: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await db.unsuspendUser(input);
        return { success: true };
      }),

    // Unban user
    unbanUser: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await db.unbanUser(input);
        return { success: true };
      }),

    // Promote user to admin (super admin only)
    promoteToAdmin: superAdminProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        await db.promoteToAdmin(input, ctx.user.id);
        return { success: true };
      }),

    // Demote from admin (super admin only)
    demoteFromAdmin: superAdminProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        await db.demoteFromAdmin(input, ctx.user.id);
        return { success: true };
      }),

    // Remove warning from user (super admin only)
    removeWarning: superAdminProcedure
      .input(z.number()) // warningId
      .mutation(async ({ ctx, input }) => {
        await db.removeWarning(input, ctx.user.id);
        return { success: true };
      }),

    // Get warnings for a specific user
    getUserWarnings: adminProcedure
      .input(z.number()) // userId
      .query(async ({ input }) => {
        const warnings = await db.getUserWarnings(input);
        return warnings;
      }),

    // Block listing (admin)
    blockListing: adminProcedure
      .input(z.object({
        listingId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.blockListing(input.listingId, ctx.user.id, input.reason);
        return { success: true };
      }),

    // Unblock listing (admin)
    unblockListing: adminProcedure
      .input(z.number()) // listingId
      .mutation(async ({ ctx, input }) => {
        await db.unblockListing(input, ctx.user.id);
        return { success: true };
      }),

    // Delete listing (super admin only)
    deleteListing: superAdminProcedure
      .input(z.object({
        listingId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteListing(input.listingId, ctx.user.id, input.reason);
        return { success: true };
      }),

    // Get all admin logs
    getAdminLogs: adminProcedure
      .input(z.object({
        adminId: z.number().optional(),
        action: z.string().optional(),
        targetType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const logs = await db.getAdminLogs(input);
        return logs;
      }),

    // Get admin logs by target
    getAdminLogsByTarget: adminProcedure
      .input(z.object({
        targetType: z.string(),
        targetId: z.number(),
      }))
      .query(async ({ input }) => {
        const logs = await db.getAdminLogsByTarget(input.targetType, input.targetId);
        return logs;
      }),



    // Get all reports
    getAllReports: adminProcedure
      .query(async () => {
        const allReports = await db.getAllReports();
        return allReports;
      }),

    // Get report by ID
    getReportById: adminProcedure
      .input(z.object({ reportId: z.number() }))
      .query(async ({ input }) => {
        const report = await db.getReportById(input.reportId);
        return report;
      }),

    // Create a new report (users can report listings/users)
    createReport: publicProcedure
      .input(z.object({
        reportedType: z.enum(['listing', 'user']),
        reportedId: z.number(),
        reason: z.string().min(1).max(255),
        message: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Must be logged in to report" });
        }
        const result = await db.createReport({
          reporterId: ctx.user.id,
          reportedType: input.reportedType,
          reportedId: input.reportedId,
          reason: input.reason,
          message: input.message,
        });
        return result;
      }),

    // Update report status
    updateReportStatus: adminProcedure
      .input(z.object({
        reportId: z.number(),
        status: z.enum(['pending', 'reviewing', 'resolved', 'dismissed']),
        resolution: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateReportStatus(
          input.reportId, 
          ctx.user.id, 
          input.status,
          input.resolution
        );
        return { success: true };
      }),

    // Delete report (super admin only)
    deleteReport: superAdminProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReport(input.reportId);
        return { success: true };
      }),

    // Get reports by user (admin only)
    getReportsByUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const reports = await db.getReportsByUser(input.userId);
        return reports;
      }),

    // Get reports by listing (admin only)
    getReportsByListing: adminProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input }) => {
        const reports = await db.getReportsByListing(input.listingId);
        return reports;
      }),

    // Get all admins
    getAllAdmins: superAdminProcedure
      .query(async () => {
        const admins = await db.getAllAdmins();
        return admins;
      }),

    // Get system settings
    getSystemSettings: superAdminProcedure
      .query(async () => {
        const settings = await db.getSystemSettings();
        return settings;
      }),

    // Update system setting
    updateSystemSetting: superAdminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateSystemSetting(input.key, input.value, ctx.user.id);
        return { success: true };
      }),

    // Get single system setting (public - for frontend display)
    getSystemSetting: publicProcedure
      .input(z.string()) // key
      .query(async ({ input }) => {
        const value = await db.getSystemSetting(input);
        return value;
      }),

    // Toggle maintenance mode
    toggleMaintenanceMode: superAdminProcedure
      .mutation(async ({ ctx }) => {
        const setting = await db.getSystemSetting('maintenance_mode');
        const currentValue = setting === 'true';
        const newValue = !currentValue;
        
        await db.updateSystemSetting('maintenance_mode', newValue.toString(), ctx.user.id);
        
        return { maintenanceMode: newValue };
      }),

    // IP Blocking / Security
    getSuspiciousIPs: superAdminProcedure
      .query(async () => {
        const ips = await db.getIPsWithMostAttempts(20);
        return ips;
      }),

    getBlockedIPs: superAdminProcedure
      .query(async () => {
        const ips = await db.getBlockedIPs();
        return ips;
      }),

    blockIP: superAdminProcedure
      .input(z.object({
        ipAddress: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.blockIP(input.ipAddress, input.reason || 'Manually blocked', ctx.user.id);
        return { success: true };
      }),

    unblockIP: superAdminProcedure
      .input(z.object({
        ipAddress: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.unblockIP(input.ipAddress);
        return { success: true };
      }),

    // Analytics for AdminStats
    getAnalytics: adminProcedure
      .input(z.object({
        timeRange: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
      }))
      .query(async ({ input }) => {
        // Mock data for now - you can implement real analytics later
        return {
          totalUsers: 150,
          newUsers: 12,
          totalListings: 85,
          newListings: 8,
          totalTransactions: 42,
          newTransactions: 5,
          totalRevenue: 2850.00,
          newRevenue: 350.00,
          userGrowthRate: 8.7,
          listingGrowthRate: 10.4,
          revenueGrowthRate: 14.0,
          avgTransactionValue: 67.86,
          topSellers: [
            { id: 1, name: "Green Genetics", revenue: 850.00, transactions: 12 },
            { id: 2, name: "Premium Seeds Co", revenue: 650.00, transactions: 9 },
            { id: 3, name: "Urban Grower", revenue: 420.00, transactions: 7 },
          ],
          revenueByMonth: [
            { month: "Nov 2024", revenue: 850.00, transactions: 12 },
            { month: "Oct 2024", revenue: 750.00, transactions: 11 },
            { month: "Sep 2024", revenue: 680.00, transactions: 10 },
          ],
          usersByStatus: [
            { status: "active", count: 142 },
            { status: "warned", count: 5 },
            { status: "suspended", count: 2 },
            { status: "banned", count: 1 },
          ],
          listingsByCategory: [
            { category: "seeds", count: 35 },
            { category: "cuttings", count: 28 },
            { category: "genetics", count: 22 },
          ],
        };
      }),

    // Security logs for AdminSecurity
    getSecurityLogs: adminProcedure
      .query(async () => {
        return await db.getSecurityLogs(50);
      }),

    // System settings for AdminSettings
    updateSystemSettings: superAdminProcedure
      .input(z.object({
        siteName: z.string().min(1),
        siteDescription: z.string().min(1),
        adminEmail: z.string().email(),
        maintenanceMode: z.boolean(),
        userRegistrationEnabled: z.boolean(),
        listingApprovalRequired: z.boolean(),
        maxListingImages: z.number().min(1).max(20),
        maxListingPrice: z.number().min(0),
        transactionFeePercent: z.number().min(0).max(100),
        minSellerRating: z.number().min(0).max(5),
        sessionTimeoutMinutes: z.number().min(15).max(480),
      }))
      .mutation(async ({ input, ctx }) => {
        // Here you would save to database - for now just return success
        console.log("[Admin] System settings updated by", ctx.user.name, input);
        return { success: true };
      }),
  }),

  // Notification routes
  notifications: router({
    // Get my notifications
    getMyNotifications: protectedProcedure
      .query(async ({ ctx }) => {
        const notifications = await db.getMyNotifications(ctx.user.id);
        return notifications;
      }),

    // Get unread count
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        const count = await db.getUnreadNotificationCount(ctx.user.id);
        return count;
      }),

    // Mark as read
    markAsRead: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input, ctx.user.id);
        return { success: true };
      }),

    // Mark all as read
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),

    // Delete notification
    deleteNotification: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        await db.deleteNotification(input, ctx.user.id);
        return { success: true };
      }),
  }),

  // Chat routes
  chat: router({
    // Get or create conversation
    getOrCreateConversation: protectedProcedure
      .input(z.object({
        listingId: z.number(),
        sellerId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getOrCreateConversation(
          input.listingId,
          ctx.user.id,
          input.sellerId
        );
        return conversation;
      }),

    // Send message
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string().min(1).max(5000),
      }))
      .mutation(async ({ ctx, input }) => {
        const message = await db.sendMessage(
          input.conversationId,
          ctx.user.id,
          input.message
        );
        return message;
      }),

    // Get conversation messages
    getMessages: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const messages = await db.getConversationMessages(input, ctx.user.id);
        return messages;
      }),

    // Get all conversations
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        const conversations = await db.getUserConversations(ctx.user.id);
        return conversations;
      }),

    // Get unread count
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        const count = await db.getUnreadMessageCount(ctx.user.id);
        return count;
      }),
  }),

  // PayPal integration
  paypal: router({
    // Create PayPal order and transaction
    createOrder: protectedProcedure
      .input(z.object({
        listingId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get listing details
        const listing = await db.getListingById(input.listingId);
        if (!listing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Listing not found',
          });
        }

        // Check if enough quantity available
        if ((listing.quantity || 0) < input.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough quantity available',
          });
        }

        // Calculate fees dynamically
        const unitPrice = listing.priceType === 'fixed' 
          ? parseFloat(listing.fixedPrice || '0')
          : parseFloat(listing.offerMinPrice || '0'); // Use offerMinPrice instead of auctionStartPrice
        const subtotal = unitPrice * input.quantity;
        
        const platformFee = parseFloat(await db.getSystemSetting('platform_fee_fixed') || '0.42') * input.quantity;
        const paypalFeePercentage = parseFloat(await db.getSystemSetting('paypal_fee_percentage') || '2.49') / 100;
        const paypalFeeFixed = parseFloat(await db.getSystemSetting('paypal_fee_fixed') || '0.49');
        const paypalFee = subtotal * paypalFeePercentage + paypalFeeFixed;
        
        const totalAmount = subtotal + platformFee + paypalFee;
        const sellerAmount = subtotal;

        // Create transaction
        const transactionId = await db.createTransaction({
          listingId: input.listingId,
          buyerId: ctx.user.id,
          sellerId: listing.sellerId,
          quantity: input.quantity,
          totalAmount: totalAmount.toFixed(2),
          platformFee: platformFee.toFixed(2),
          sellerAmount: sellerAmount.toFixed(2),
        });

        return { orderId: 'mock-order-id', transactionId };
      }),

    // Capture PayPal order
    captureOrder: protectedProcedure
      .input(z.object({
        orderId: z.string(),
        transactionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get transaction details
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          });
        }

        // Update transaction status
        await db.updateTransaction(input.transactionId, {
          status: 'completed',
        });

        // Reduce listing quantity
        await db.reduceListingQuantity(transaction.listingId, transaction.quantity);

        return { success: true, transactionId: input.transactionId };
      }),
  }),

  // Offer management (price negotiation)
  offer: router({
    create: protectedProcedure
      .input(z.object({
        listingId: z.number(),
        offerAmount: z.number().positive(),
        message: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const listing = await db.getListing(input.listingId);
        if (!listing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
        }
        if (!(listing.acceptsOffers || listing.priceType === 'offer')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Listing does not accept offers' });
        }
        const min = listing.offerMinPrice ? parseFloat(listing.offerMinPrice) : 0;
        if (input.offerAmount < min) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer below minimum price' });
        }
        if (listing.sellerId === ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot offer on own listing' });
        }
        // expiring handled inside createOffer (system setting offer_expiration_days)
        const id = await db.createOffer({
          listingId: listing.id,
          buyerId: ctx.user.id,
          sellerId: listing.sellerId,
          offerAmount: input.offerAmount,
          message: input.message,
        });
        return { success: true, offerId: id };
      }),

    getMine: protectedProcedure
      .input(z.object({ page: z.number().min(1).default(1), pageSize: z.number().min(1).max(100).default(25), status: z.enum(['pending','accepted','rejected','countered','expired']).optional() }).optional())
      .query(async ({ ctx, input }) => {
        await db.expireOffers();
        const page = input?.page || 1;
        const pageSize = input?.pageSize || 25;
        const status = input?.status;
        const { items, total } = await db.getOffersForBuyerPaginated(ctx.user.id, page, pageSize, status);
        return { items, page, pageSize, total };
      }),

    getIncoming: protectedProcedure
      .input(z.object({ page: z.number().min(1).default(1), pageSize: z.number().min(1).max(100).default(25), status: z.enum(['pending','accepted','rejected','countered','expired']).optional() }).optional())
      .query(async ({ ctx, input }) => {
        await db.expireOffers();
        const page = input?.page || 1;
        const pageSize = input?.pageSize || 25;
        const status = input?.status;
        const { items, total } = await db.getOffersForSellerPaginated(ctx.user.id, page, pageSize, status);
        return { items, page, pageSize, total };
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const offer = await db.getOfferById(input);
        if (!offer) throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
        if (offer.buyerId !== ctx.user.id && offer.sellerId !== ctx.user.id && ctx.user.role === 'user') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'No access to offer' });
        }
        return offer;
      }),

    accept: protectedProcedure
      .input(z.object({ offerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const offer = await db.getOfferById(input.offerId);
        if (!offer) throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
        if (offer.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not seller' });
        if (offer.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer not pending' });
        await db.acceptOffer(offer.id);
        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({ offerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const offer = await db.getOfferById(input.offerId);
        if (!offer) throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
        if (offer.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not seller' });
        if (offer.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer not pending' });
        await db.rejectOffer(offer.id);
        return { success: true };
      }),

    counter: protectedProcedure
      .input(z.object({ offerId: z.number(), counterAmount: z.number().positive(), counterMessage: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const offer = await db.getOfferById(input.offerId);
        if (!offer) throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
        if (offer.sellerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not seller' });
        if (offer.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer not pending' });
        if (input.counterAmount <= parseFloat(offer.offerAmount as any)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Counter must be higher than original offer (oder Geschäftslogik anpassen)' });
        }
        await db.counterOffer(offer.id, input.counterAmount, input.counterMessage);
        return { success: true };
      }),

    respondToCounter: protectedProcedure
      .input(z.object({ offerId: z.number(), action: z.enum(['accept', 'reject']) }))
      .mutation(async ({ ctx, input }) => {
        const offer = await db.getOfferById(input.offerId);
        if (!offer) throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
        if (offer.buyerId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not buyer' });
        if (offer.status !== 'countered') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Offer not countered' });
        await db.respondToCounter(offer.id, input.action);
        return { success: true };
      }),

    getPending: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getPendingActionsForUser(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;