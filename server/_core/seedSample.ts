import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, sellerProfiles, listings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for seeding");
  const pool = mysql.createPool(url);
  return { db: drizzle(pool), pool } as const;
}

type SeedDatabase = Awaited<ReturnType<typeof getDb>>["db"];

async function ensureUser(db: SeedDatabase, openId: string, name: string) {
  const existing = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (existing.length) return existing[0];
  await db.insert(users).values({ openId, name, role: "user", lastSignedIn: new Date() });
  const created = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return created[0];
}

async function ensureSellerProfile(db: SeedDatabase, userId: number) {
  const existing = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId)).limit(1);
  if (existing.length) return existing[0];
  await db.insert(sellerProfiles).values({ userId, shopName: "Green Garden", description: "Quality genetics.", location: "Local" });
  const created = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId)).limit(1);
  return created[0];
}

async function seedListings(db: SeedDatabase, sellerId: number) {
  const existing = await db.select().from(listings).where(eq(listings.sellerId, sellerId));
  if (existing.length > 0) return existing.length;

  await db.insert(listings).values([
    {
      sellerId,
      type: "cutting",
      strain: "Super Lemon Haze",
      description: "Fresh cuttings, strong citrus profile.",
      quantity: 10,
      priceType: "fixed",
      fixedPrice: "5.00",
      acceptsOffers: false,
      shippingVerified: true,
      shippingPickup: false,
      status: "active",
      genetics: "sativa",
    },
    {
      sellerId,
      type: "seed",
      strain: "Purple Kush",
      description: "Feminized seeds, purple hues.",
      quantity: 20,
      priceType: "fixed",
      fixedPrice: "12.00",
      acceptsOffers: true,
      offerMinPrice: "10.00",
      shippingVerified: true,
      shippingPickup: true,
      status: "active",
      genetics: "indica",
    },
  ]);
  return 2;
}

async function main() {
  const { db, pool } = await getDb();
  const seededDb = db as SeedDatabase;
  try {
    const seller = await ensureUser(seededDb, "seller-local", "Local Seller");
    const buyer = await ensureUser(seededDb, "buyer-local", "Local Buyer");
    await ensureSellerProfile(seededDb, seller.id);
    const count = await seedListings(seededDb, seller.id);
    console.log(`Seeded sample data: users=2, listings=${count}`);
    console.log("Try logging in as:");
    console.log("  /api/dev-login?openId=seller-local&name=Local%20Seller");
    console.log("  /api/dev-login?openId=buyer-local&name=Local%20Buyer");
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error("Failed to seed sample data:", err);
  process.exit(1);
});
