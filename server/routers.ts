import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
// PayPal integration will be added when API keys are provided

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
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    activateSeller: protectedProcedure
      .input(z.object({
        shopName: z.string().min(3).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is already a seller
        if (ctx.user.isSellerActive) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a seller",
          });
        }

        // Create seller profile
        await db.createSellerProfile(
          ctx.user.id,
          input.shopName,
          input.description,
          ctx.user.location || undefined
        );

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
        shopName: z.string().min(3).max(255),
        description: z.string().optional(),
        location: z.string().optional(),
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
        shopName: z.string().min(3).max(255).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
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
        priceType: z.enum(["fixed", "auction"]),
        fixedPrice: z.number().positive().optional(),
        auctionStartPrice: z.number().positive().optional(),
        auctionEndTime: z.date().optional(),
        imageUrl: z.string().url().optional(),
        images: z.array(z.string().url()).optional(),
        shippingVerified: z.boolean().default(true),
        shippingPickup: z.boolean().default(false),
        // Additional optional fields
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

        // Validate price based on type
        if (input.priceType === "fixed" && !input.fixedPrice) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Fixed price listings must have a fixedPrice",
          });
        }

        if (input.priceType === "auction" && !input.auctionStartPrice) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Auction listings must have an auctionStartPrice",
          });
        }

        await db.createListing(ctx.user.id, {
          type: input.type,
          strain: input.strain,
          description: input.description,
          quantity: input.quantity,
          priceType: input.priceType,
          fixedPrice: input.fixedPrice,
          auctionStartPrice: input.auctionStartPrice,
          auctionEndTime: input.auctionEndTime,
          imageUrl: input.imageUrl,
          images: input.images ? JSON.stringify(input.images) : undefined,
          shippingVerified: input.shippingVerified,
          shippingPickup: input.shippingPickup,
          // Additional optional fields
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
        if (!listing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }
        return listing;
      }),

    // Get all active listings (paginated)
    getActive: publicProcedure
      .input(z.object({
        limit: z.number().int().positive().max(100).default(50),
        offset: z.number().int().nonnegative().default(0),
      }))
      .query(async ({ input }) => {
        return db.getActiveListings(input.limit, input.offset);
      }),

    // Get seller's listings
    getBySellerID: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getSellerListings(input);
      }),

    // Get current user's listings
    getMine: protectedProcedure.query(async ({ ctx }) => {
      return db.getSellerListings(ctx.user.id);
    }),

    // Update a listing
    update: protectedProcedure
      .input(z.object({
        listingId: z.number(),
        strain: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().int().positive().optional(),
        fixedPrice: z.number().positive().optional(),
        status: z.enum(["active", "sold", "ended", "draft"]).optional(),
        shippingVerified: z.boolean().optional(),
        shippingPickup: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const listing = await db.getListing(input.listingId);
        if (!listing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }

        // Check ownership
        if (listing.sellerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own listings",
          });
        }

        await db.updateListing(input.listingId, {
          strain: input.strain,
          description: input.description,
          quantity: input.quantity,
          fixedPrice: input.fixedPrice ? String(input.fixedPrice) : undefined,
          status: input.status,
          shippingVerified: input.shippingVerified,
          shippingPickup: input.shippingPickup,
        } as any);

        return { success: true };
      }),

    // Delete/archive a listing
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const listing = await db.getListing(input);
        if (!listing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }

        // Check ownership
        if (listing.sellerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own listings",
          });
        }

        await db.updateListing(input, { status: "ended" } as any);
        return { success: true };
      }),
  }),

  // Transaction routes
  transaction: router({
    // Get buyer's transactions
    getBuyerTransactions: protectedProcedure.query(async ({ ctx }) => {
      return db.getBuyerTransactions(ctx.user.id);
    }),

    // Get seller's transactions
    getSellerTransactions: protectedProcedure.query(async ({ ctx }) => {
      return db.getSellerTransactions(ctx.user.id);
    }),
  }),

  // PayPal routes
  paypal: router({
    createOrder: publicProcedure
      .input(
        z.object({
          listingId: z.number(),
          quantity: z.number(),
          amount: z.string(),
          buyerId: z.number(),
          sellerId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return {
          id: `MOCK-ORDER-${Date.now()}`,
          status: "CREATED",
        };
      }),

    captureOrder: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .mutation(async ({ input }) => {
        return {
          transactionId: `MOCK-TXN-${Date.now()}`,
          status: "COMPLETED",
        };
      }),
  }),

  // Image upload router
  upload: router({
    image: protectedProcedure
      .input(z.object({
        filename: z.string(),
        data: z.string(), // base64 encoded image
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const { externalStoragePut, isExternalStorageEnabled } = await import("./external-storage");
        
        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64Data = input.data.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        
        // Generate unique filename
        const ext = input.filename.split(".").pop() || "jpg";
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `uploads/${Date.now()}-${randomSuffix}.${ext}`;
        
        // Choose storage provider (Manus or external)
        let url: string;
        
        if (isExternalStorageEnabled()) {
          // Use external storage (Cloudflare R2 or Backblaze B2)
          const result = await externalStoragePut(fileKey, buffer, input.contentType);
          url = result.url;
          console.log(`[Upload] Uploaded to external storage: ${url}`);
        } else {
          // Use Manus built-in storage (default)
          const result = await storagePut(fileKey, buffer, input.contentType);
          url = result.url;
        }
        
        return { url };
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
            message: "You have already reviewed this transaction",
          });
        }

        // Check if transaction exists and belongs to the buyer
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction || transaction.buyerId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found",
          });
        }

        // Check if transaction is within 90 days
        const daysSincePurchase = Math.floor((Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePurchase > 90) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Review period has expired (90 days)",
          });
        }

        // Create review
        await db.createReview({
          sellerId: input.sellerId,
          buyerId: ctx.user.id,
          transactionId: input.transactionId,
          rating: input.rating,
          comment: input.comment,
        });

        // Update seller rating
        await db.updateSellerRating(input.sellerId);

        return { success: true };
      }),

    // Get all reviews for a seller
    getBySellerId: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const reviews = await db.getReviewsBySellerId(input);
        return reviews;
      }),

    // Check if user can review a transaction
    canReview: protectedProcedure
      .input(z.number()) // transactionId
      .query(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input);
        if (!transaction || transaction.buyerId !== ctx.user.id) {
          return { canReview: false, reason: "Transaction not found" };
        }

        const existingReview = await db.getReviewByTransactionAndBuyer(input, ctx.user.id);
        if (existingReview) {
          return { canReview: false, reason: "Already reviewed" };
        }

        const daysSincePurchase = Math.floor((Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePurchase > 90) {
          return { canReview: false, reason: "Review period expired" };
        }

        return { canReview: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

