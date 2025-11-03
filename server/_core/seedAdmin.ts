import "dotenv/config";
import * as db from "../db";
import { ENV } from "./env";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required to seed admin");
    process.exit(1);
  }

  const openId = ENV.ownerOpenId || process.env.OWNER_OPEN_ID || "";
  const name = process.env.ADMIN_NAME || "Admin";

  if (!openId) {
    console.error("OWNER_OPEN_ID is required. Set it in .env or pass OWNER_OPEN_ID env var.");
    process.exit(1);
  }

  await db.upsertUser({
    openId,
    name,
    role: "admin" as const,
    lastSignedIn: new Date(),
  });

  console.log(`Seeded/updated admin user with openId='${openId}' and name='${name}'.`);
  console.log("You can now login locally via:");
  console.log(`  http://localhost:${process.env.PORT || 3000}/api/dev-login?openId=${encodeURIComponent(openId)}&name=${encodeURIComponent(name)}`);
}

main().catch(err => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});

