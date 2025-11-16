import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

let HAS_DB = false;

beforeAll(async () => {
  const database = await db.getDb();
  if (database) {
    HAS_DB = true;
    await database.execute("DELETE FROM blockedIPs WHERE ip LIKE '10.0.%'");
    await database.execute("DELETE FROM loginAttempts WHERE ip LIKE '10.0.%'");
  } else {
    // Signal skip
    console.warn('[security.test] Keine DB Verbindung – Tests werden übersprungen');
  }
});

const maybeSkip = HAS_DB ? describe : describe.skip;

maybeSkip("IP Blocking Security", () => {

  describe("blockIP", () => {
    it("should block an IP successfully", async () => {
      const result = await db.blockIP("10.0.0.1", "Test block", 1);
      expect(result.success).toBe(true);

      const isBlocked = await db.isIPBlocked("10.0.0.1");
      expect(isBlocked).toBe(true);
    });

    it("should prevent duplicate blocks", async () => {
      await db.blockIP("10.0.0.2", "First block", 1);
      const result = await db.blockIP("10.0.0.2", "Second block", 1);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("already blocked");
    });
  });

  describe("unblockIP", () => {
    it("should unblock a blocked IP", async () => {
      await db.blockIP("10.0.0.3", "Test block", 1);
      
      const result = await db.unblockIP("10.0.0.3", 1);
      expect(result.success).toBe(true);

      const isBlocked = await db.isIPBlocked("10.0.0.3");
      expect(isBlocked).toBe(false);
    });

    it("should fail to unblock non-blocked IP", async () => {
      const result = await db.unblockIP("10.0.0.99", 1);
      expect(result.success).toBe(false);
      expect(result.message).toContain("not currently blocked");
    });
  });

  describe("getBlockedIPs", () => {
    it("should return blocked IPs with metadata", async () => {
      await db.blockIP("10.0.0.4", "Test reason", 1);
      
      const blocked = await db.getBlockedIPs();
      const testIP = blocked.find(b => b.ipAddress === "10.0.0.4");
      
      expect(testIP).toBeDefined();
      expect(testIP?.reason).toBe("Test reason");
      expect(testIP?.isActive).toBe(true);
    });
  });

  describe("trackLoginAttempt", () => {
    it("should track login attempts", async () => {
      await db.trackLoginAttempt("10.0.0.5", 1, "TestBrowser", true);
      await db.trackLoginAttempt("10.0.0.5", 1, "TestBrowser", false);

      const attempts = await db.getIPsWithMostAttempts(10);
      const testIP = attempts.find(a => a.ip === "10.0.0.5");
      
      // Should track at least the failed attempt
      expect(testIP).toBeDefined();
    });

    it("should auto-block after 5 failed attempts", async () => {
      const testIP = "10.0.0.6";
      
      // 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await db.trackLoginAttempt(testIP, null, "TestBrowser", false);
      }

      // Wait a bit for auto-block to trigger
      await new Promise(resolve => setTimeout(resolve, 100));

      const isBlocked = await db.isIPBlocked(testIP);
      expect(isBlocked).toBe(true);
    });
  });

  describe("getIPsWithMostAttempts", () => {
    it("should return IPs sorted by failed attempts", async () => {
      // Create test data
      await db.trackLoginAttempt("10.0.0.7", null, "Browser", false);
      await db.trackLoginAttempt("10.0.0.7", null, "Browser", false);
      await db.trackLoginAttempt("10.0.0.7", null, "Browser", false);

      const attempts = await db.getIPsWithMostAttempts(5);
      const testIP = attempts.find(a => a.ip === "10.0.0.7");
      
      expect(testIP).toBeDefined();
      expect(testIP?.attemptCount).toBeGreaterThanOrEqual(3);
    });
  });
});
