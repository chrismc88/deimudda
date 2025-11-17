import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';

describe('Limits & Policies Integration', () => {
  let database: any;
  beforeAll(async () => {
    database = await getDb();
    if (!database) {
      console.warn('[limitsSecurity.test] Keine DB Verbindung – Tests werden übersprungen');
    }
  });

  it('enforces max_offers_per_listing', async () => {
    if (!database) return;
    await db.updateSystemSetting('max_offers_per_listing', '2', 1);
    // Simuliere 2 bestehende Offers
    const listingId = 12345;
    await database.execute(`DELETE FROM offers WHERE listingId=${listingId}`);
    await database.execute(`INSERT INTO offers (listingId,buyerId,sellerId,offerAmount,status,createdAt,updatedAt) VALUES (${listingId},2,3,10.00,'pending',NOW(),NOW()),(${listingId},4,3,12.00,'pending',NOW(),NOW())`);
    // Dritter Offer sollte abgelehnt werden
    let errorCaught = false;
    try {
      // Annahme: createOffer prüft max_offers_per_listing
      await db.createOffer({ listingId, buyerId: 5, sellerId: 3, offerAmount: 15.00 });
    } catch (e: any) {
      errorCaught = true;
      expect(e.message).toContain('max_offers_per_listing');
    }
    expect(errorCaught).toBe(true);
  });

  it('enforces max_listing_price', async () => {
    if (!database) return;
    await db.updateSystemSetting('max_listing_price', '100', 1);
    // Listing mit zu hohem Preis
    let errorCaught = false;
    try {
      await db.createListing({ sellerId: 2, type: 'cutting', strain: 'Test', priceType: 'fixed', fixedPrice: 150.00, quantity: 1, status: 'active' });
    } catch (e: any) {
      errorCaught = true;
      expect(e.message).toContain('max_listing_price');
    }
    expect(errorCaught).toBe(true);
  });

  it('enforces min_offer_amount', async () => {
    if (!database) return;
    await db.updateSystemSetting('min_offer_amount', '20', 1);
    // Offer unter Mindestbetrag
    let errorCaught = false;
    try {
      await db.createOffer({ listingId: 12346, buyerId: 6, sellerId: 7, offerAmount: 10.00 });
    } catch (e: any) {
      errorCaught = true;
      expect(e.message).toContain('min_offer_amount');
    }
    expect(errorCaught).toBe(true);
  });
});
