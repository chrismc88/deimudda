// Quick admin user creation for testing
import { getDb } from "./db.js";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export async function createTestAdmin() {
  const db = await getDb();
  if (!db) {
    console.log("❌ Database not available");
    return;
  }

  try {
    // Check if admin already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, "admin@test.com"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("✅ Test admin already exists");
      return existingAdmin[0];
    }

    // Create test admin user
    const adminUser = await db.insert(users).values({
      openId: "test-admin-" + Date.now(),
      name: "Test Admin",
      email: "admin@test.com",
      loginMethod: "manual",
      role: "super_admin",
      status: "active",
      nickname: "TestAdmin",
      ageVerified: true,
      isSellerActive: false,
    });

    console.log("✅ Test admin user created successfully");
    console.log("📧 Email: admin@test.com");
    console.log("👤 Role: super_admin");
    
    return adminUser;
  } catch (error) {
    console.error("❌ Failed to create test admin:", error);
  }
}

// Auto-create admin on import in development
if (process.env.NODE_ENV === "development") {
  createTestAdmin();
}