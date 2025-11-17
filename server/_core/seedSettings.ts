/**
 * Seed script to initialize system settings in the database
 * Run with: pnpm exec tsx server/_core/seedSettings.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../../drizzle/schema";

const DEFAULT_SETTINGS = [
  // Fees (Gebührenstruktur)
  {
    key: "platform_fee_fixed",
    value: "0.42",
    category: "fees",
    description: "Feste Plattformgebühr in EUR pro Transaktion",
  },
  {
    key: "paypal_fee_percentage",
    value: "2.49",
    category: "fees",
    description: "PayPal-Gebühr in Prozent",
  },
  {
    key: "paypal_fee_fixed",
    value: "0.49",
    category: "fees",
    description: "Feste PayPal-Gebühr in EUR",
  },

  // Limits
  {
    key: "max_listing_images",
    value: "10",
    category: "limits",
    description: "Maximale Anzahl Bilder pro Listing",
  },
  {
    key: "max_listing_price",
    value: "1000",
    category: "limits",
    description: "Maximaler Listing-Preis in EUR",
  },
  {
    key: "min_listing_price",
    value: "0.50",
    category: "limits",
    description: "Minimaler Listing-Preis in EUR",
  },
  {
    key: "max_active_listings_per_user",
    value: "50",
    category: "limits",
    description: "Maximale aktive Listings pro Benutzer",
  },
  {
    key: "image_max_size_mb",
    value: "5",
    category: "limits",
    description: "Maximale Bildgröße in MB",
  },

  // General / Business
  {
    key: "min_age_requirement",
    value: "18",
    category: "general",
    description: "Mindestalter für Nutzer",
  },
  {
    key: "review_window_days",
    value: "90",
    category: "general",
    description: "Tage nach Transaktion für Bewertungen",
  },
  {
    key: "registration_enabled",
    value: "true",
    category: "general",
    description: "Registrierung für neue Nutzer erlaubt",
  },
  {
    key: "maintenance_mode",
    value: "false",
    category: "general",
    description: "Plattform im Wartungsmodus",
  },

  // Security
  {
    key: "warning_threshold",
    value: "3",
    category: "security",
    description: "Anzahl Verwarnungen vor automatischer Sperrung",
  },
  {
    key: "suspension_max_days",
    value: "365",
    category: "security",
    description: "Maximale Sperrdauer in Tagen",
  },
  {
    key: "max_login_attempts_per_ip",
    value: "10",
    category: "security",
    description: "Maximale Login-Versuche pro IP in 15 Minuten",
  },
  {
    key: "max_login_attempts_per_user",
    value: "5",
    category: "security",
    description: "Maximale Login-Versuche pro Benutzer in 15 Minuten",
  },
  {
    key: "login_lockout_duration_minutes",
    value: "30",
    category: "security",
    description: "Sperrung nach fehlgeschlagenen Versuchen in Minuten",
  },
];

async function seedSettings() {
  try {
    console.log("🌱 Starting system settings seed...");

    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable not set");
      process.exit(1);
    }

    // Create drizzle instance directly from DATABASE_URL
    const db = drizzle(process.env.DATABASE_URL);

    // Check if settings already exist
    const existing = await db
      .select()
      .from(schema.systemSettings)
      .limit(1);

    if (existing.length > 0) {
      console.log("⚠️  System settings already exist. Skipping seed.");
      process.exit(0);
    }

    // Insert all settings
    await db.insert(schema.systemSettings).values(
      DEFAULT_SETTINGS.map((setting) => ({
        key: setting.key,
        value: setting.value,
        category: setting.category as any,
        description: setting.description,
        updatedBy: null,
      }))
    );

    console.log("✅ System settings seeded successfully!");
    console.log(`📊 ${DEFAULT_SETTINGS.length} settings initialized`);

    // Show what was inserted
    console.log("\n📋 Settings initialized:");
    DEFAULT_SETTINGS.forEach((s) => {
      console.log(`  - ${s.key}: ${s.value} (${s.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding settings:", error);
    process.exit(1);
  }
}

seedSettings();
