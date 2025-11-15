import "dotenv/config";
import mysql from "mysql2/promise";

async function validatePhase1() {
  let connection: mysql.Connection | null = null;
  try {
    const url = new URL(process.env.DATABASE_URL || "");
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || "3306"),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    });

    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    console.log("║          PHASE 1 VALIDATION - DATABASE SCHEMA CHECK            ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    // Check tables
    const [tables]: [any[], any] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() ORDER BY TABLE_NAME"
    );

    console.log(`📊 TABLE COUNT: ${tables.length} tables\n`);
    console.log("✅ TABLES IN DATABASE:");

    const expectedTables = [
      "users",
      "sellerProfiles",
      "listings",
      "offers",
      "transactions",
      "reviews",
      "messages",
      "notifications",
      "warnings",
      "suspensions",
      "bans",
      "reports",
      "loginAttempts",
      "blockedIPs",
      "adminLogs",
      "systemSettings",
    ];

    const actualTables = tables.map((t: any) => t.TABLE_NAME);
    let allTablesFound = true;

    expectedTables.forEach((expected) => {
      const found = actualTables.includes(expected);
      const status = found ? "✓" : "✗";
      const color = found ? "✅" : "❌";
      console.log(`  ${color} ${status} ${expected}`);
      if (!found) allTablesFound = false;
    });

    console.log("\n" + (allTablesFound ? "✅ ALL TABLES PRESENT" : "❌ MISSING TABLES"));

    // Check users table columns
    console.log("\n📋 USERS TABLE COLUMNS (with admin features):");
    const [userCols]: [any[], any] = await connection.execute(
      "DESCRIBE users"
    );

    const requiredUserCols = [
      "id",
      "openId",
      "role",
      "status",
      "warningCount",
      "suspendedUntil",
      "bannedAt",
      "bannedReason",
    ];

    userCols.forEach((col: any) => {
      const isRequired = requiredUserCols.includes(col.Field);
      const marker = isRequired ? "🔑" : "   ";
      console.log(`  ${marker} ${col.Field}: ${col.Type}`);
    });

    // Check systemSettings
    console.log("\n⚙️  SYSTEM SETTINGS:");
    const [settings]: [any[], any] = await connection.execute(
      "SELECT COUNT(*) as count FROM systemSettings"
    );
    const settingCount = (settings[0] as any).count;
    console.log(`  ✓ ${settingCount} settings initialized`);

    if (settingCount === 17) {
      console.log("  ✅ All 17 required settings present");
    } else {
      console.log(`  ⚠️  Expected 17 settings, found ${settingCount}`);
    }

    // Summary
    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    if (allTablesFound && settingCount === 17) {
      console.log("║                    ✅ PHASE 1.1 COMPLETE                        ║");
      console.log("║                  All schemas validated!                         ║");
    } else {
      console.log("║                    ⚠️ PHASE 1.1 INCOMPLETE                       ║");
    }
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

validatePhase1();
