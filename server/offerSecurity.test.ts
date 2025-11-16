import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';
import { systemSettings, blockedIPs, notifications, loginAttempts } from '../drizzle/schema';
import { eq } from 'drizzle-orm/expressions';

// NOTE: These tests assume a test database configured via DATABASE_URL.
// They focus on security-related dynamic settings logic.

describe('Security & Settings Integration', () => {
  let database: any;
  beforeAll(async () => {
    database = await getDb();
    // Falls keine DB erreichbar (z.B. CI ohne MySQL), Tests soft-skip.
    if (!database) {
      console.warn('[offerSecurity.test] Keine DB Verbindung – Tests werden übersprungen');
    }
  });

  it('applies max_login_attempts and auto-blocks IP', async () => {
    if (!database) return;
    await db.updateSystemSetting('max_login_attempts', '3', 1);
    const testIP = '203.0.113.55';
    // Clean previous attempts & blocks
    await database.execute(`DELETE FROM loginAttempts WHERE ip='${testIP}'`);
    await database.execute(`DELETE FROM blockedIPs WHERE ip='${testIP}'`);

    for (let i=0;i<3;i++) {
      await db.trackLoginAttempt(testIP, null, 'test-agent', false);
    }
    const isBlocked = await db.isIPBlocked(testIP);
    expect(isBlocked).toBe(true);
  });

  it('auto-unblocks after ip_block_duration_hours expires', async () => {
    if (!database) return;
    await db.updateSystemSetting('ip_block_duration_hours', '1', 1);
    const testIP = '203.0.113.77';
    await database.execute(`DELETE FROM blockedIPs WHERE ip='${testIP}'`);
    await db.blockIP(testIP, 'Test block', 1);
    // Force blockedAt into the past > 1h
    await database.execute(`UPDATE blockedIPs SET blockedAt = DATE_SUB(NOW(), INTERVAL 2 HOUR) WHERE ip='${testIP}' AND unblockedAt IS NULL`);
    const status1 = await db.isIPBlocked(testIP);
    expect(status1).toBe(false); // should auto-unblock
  });

  it('cleans up old notifications using retention setting', async () => {
    if (!database) return;
    await db.updateSystemSetting('notification_retention_days', '1', 1);
    // Insert mock old notification (2 days old)
    await database.execute(`INSERT INTO notifications (userId,type,title,message,createdAt,isRead) VALUES (1,'test','Alt','Zu alt', DATE_SUB(NOW(), INTERVAL 2 DAY), 0)`);
    const deleted = await db.cleanupOldNotifications(1);
    expect(deleted).toBeGreaterThanOrEqual(1);
  });

  it('enforces seller_payout_minimum during acceptOffer', async () => {
    if (!database) return;
    await db.updateSystemSetting('seller_payout_minimum', '10', 1);
    // Mock offer environment using overrides
    const offerId = 9999;
    const listingId = 555;
    let accepted = false;
    db.__setOfferTestOverrides({
      getOfferById: async () => ({ id: offerId, listingId, offerAmount: '5.00', buyerId: 2, sellerId: 3, status: 'pending' }),
      getListing: async () => ({ id: listingId, status: 'active', quantity: 10 }),
      updateOffer: async () => {},
      createTransaction: async () => {},
      reduceListingQuantity: async () => {},
      getSystemSetting: db.getSystemSetting,
      createNotification: async () => {},
    });
    try {
      await db.acceptOffer(offerId);
      accepted = true;
    } catch (e: any) {
      expect(e.message).toContain('Auszahlungsbetrag');
    }
    expect(accepted).toBe(false);
  });
});
