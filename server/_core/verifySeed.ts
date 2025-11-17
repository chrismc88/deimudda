import "dotenv/config";
import mysql from "mysql2/promise";

async function verifySeed() {
  let connection: mysql.Connection | null = null;
  try {
    // Parse DATABASE_URL
    const url = new URL(process.env.DATABASE_URL || "");
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || "3306"),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    });

    const [rows]: [any[], any] = await connection.execute(
      "SELECT id, `key`, value, category FROM systemSettings ORDER BY category, `key`"
    );

    console.log(`\n✓ Found ${rows.length} settings in database:\n`);
    if (rows.length === 0) {
      console.log("  ⚠️  No settings found!");
      process.exit(1);
    }

    const grouped: { [key: string]: any[] } = {};
    rows.forEach((row: any) => {
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push(row);
    });

    Object.entries(grouped).forEach(([category, items]) => {
      console.log(`📂 ${category}:`);
      (items as any[]).forEach((item) => {
        console.log(`   - ${item.key.padEnd(35)} = ${String(item.value).padEnd(15)} (ID: ${item.id})`);
      });
      console.log();
    });

    console.log(`✅ System settings verified! Total: ${rows.length} settings\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying settings:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifySeed();
