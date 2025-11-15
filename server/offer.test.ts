import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from './db';
import { offers } from '../drizzle/schema';

describe('acceptOffer()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('akzeptiert Angebot: setzt Status, erstellt Transaktion, reduziert Menge', async () => {
		const offer = {
			id: 1,
			listingId: 10,
			buyerId: 2,
			sellerId: 3,
			offerAmount: '100.00',
			status: 'pending',
		} as any;
		const listing = {
			id: 10,
			status: 'active',
			quantity: 5,
		} as any;

		// Override internals
		const updateSpy = vi.fn().mockResolvedValue(undefined);
		const trxSpy = vi.fn().mockResolvedValue(undefined);
		const reduceSpy = vi.fn().mockResolvedValue({ success: true, remaining: 4 });
		const settingSpy = vi.fn().mockImplementation(async (key: string) => {
			switch (key) {
				case 'platform_fee_fixed': return '0.42';
				case 'paypal_fee_percentage': return '2.49';
				case 'paypal_fee_fixed': return '0.49';
				default: return null;
			}
		});
		db.__setOfferTestOverrides({
			getOfferById: async () => offer,
			getListing: async () => listing,
			updateOffer: updateSpy as any,
			createTransaction: trxSpy as any,
			reduceListingQuantity: reduceSpy as any,
			getSystemSetting: settingSpy as any,
		});

		await db.acceptOffer(offer.id);

		// Assertions
		expect(settingSpy).toHaveBeenCalled();
		expect(updateSpy).toHaveBeenCalledWith(offer.id, expect.objectContaining({ status: 'accepted' }));
		expect(trxSpy).toHaveBeenCalledTimes(1);
		const trxArg = (trxSpy.mock.calls[0] as any)[0];
		expect(trxArg.listingId).toBe(offer.listingId);
		expect(trxArg.quantity).toBe(1);
		// Plattformfee 0.42, PayPal: 100*0.0249 + 0.49 = 2.98, Total = 103.40
		expect(trxArg.totalAmount).toBe('103.40');
		expect(trxArg.platformFee).toBe('0.42');
		expect(trxArg.sellerAmount).toBe('100.00');
		expect(reduceSpy).toHaveBeenCalledWith(listing.id, 1);
	});

	it('wirft Fehler wenn Listing nicht aktiv / Menge 0', async () => {
		const offer = {
			id: 2,
			listingId: 11,
			buyerId: 2,
			sellerId: 3,
			offerAmount: '50.00',
			status: 'pending',
		} as any;
		const listing = { id: 11, status: 'sold', quantity: 0 } as any;
		db.__setOfferTestOverrides({
			getOfferById: async () => offer,
			getListing: async () => listing,
			getSystemSetting: async () => null,
			updateOffer: async () => {},
			createTransaction: async () => {},
			reduceListingQuantity: async () => ({ success: true, remaining: 0 }),
		});

		await expect(db.acceptOffer(offer.id)).rejects.toThrow(/Listing no longer available/);
	});

	it('wirft Fehler wenn Angebot fehlt', async () => {
		db.__setOfferTestOverrides({ getOfferById: async () => undefined });
		await expect(db.acceptOffer(999)).rejects.toThrow(/Offer not found/);
	});
});

describe('Offer Lifecycle: counter & respond', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('counterOffer setzt Status countered + Felder', async () => {
		const updateSpy = vi.fn();
		db.__setOfferTestOverrides({ updateOffer: updateSpy as any });
		await db.counterOffer(5, 120.5, 'Neuer Preis');
		expect(updateSpy).toHaveBeenCalledWith(5, expect.objectContaining({
			status: 'countered',
			counterAmount: '120.5',
			counterMessage: 'Neuer Preis'
		}));
	});

	it('respondToCounter akzeptiert: ruft acceptOffer', async () => {
		const offer = { id: 7, status: 'countered', listingId: 1, buyerId: 2, sellerId: 3, offerAmount: '80.00' } as any;
		const acceptSpy = vi.fn().mockResolvedValue(undefined);
		db.__setOfferTestOverrides({
			getOfferById: async () => offer,
			acceptOffer: acceptSpy as any,
		});
		await db.respondToCounter(7, 'accept');
		expect(acceptSpy).toHaveBeenCalledWith(7);
	});

	it('respondToCounter lehnt ab: ruft rejectOffer', async () => {
		const offer = { id: 8, status: 'countered', listingId: 1, buyerId: 2, sellerId: 3, offerAmount: '90.00' } as any;
		const rejectSpy = vi.fn().mockResolvedValue(undefined);
		db.__setOfferTestOverrides({
			getOfferById: async () => offer,
			rejectOffer: rejectSpy as any,
		});
		await db.respondToCounter(8, 'reject');
		expect(rejectSpy).toHaveBeenCalledWith(8);
	});
});

describe('expireOffers()', () => {
	it('setzt passende Angebote auf expired (smoke)', async () => {
		const updateSpy = vi.fn().mockReturnValue({ where: vi.fn() });
		const fakeDb = { update: () => ({ set: () => ({ where: updateSpy }) }) } as any;
			db.__setOfferTestOverrides({ getDb: async () => fakeDb });
		await db.expireOffers(new Date());
		expect(updateSpy).toHaveBeenCalledTimes(1);
	});
});

describe('Pagination helpers (Smoke)', () => {
	it('getOffersForBuyerPaginated aggregiert total und items', async () => {
		const fakeDb = {
			select: (sel?: any) => ({
				from: () => ({
					where: () => {
						// COUNT query path
						if (sel && sel.count !== undefined) return [{ count: 3 }];
						// Items query path -> return chain supporting orderBy/limit/offset
						return {
							orderBy: () => ({
								limit: () => ({
									offset: () => [{ id: 1 }, { id: 2 }]
								})
							})
						};
					}
				})
			})
		} as any;
		db.__setOfferTestOverrides({ getDb: async () => fakeDb });
		const result = await db.getOffersForBuyerPaginated(2, 1, 25);
		expect(result.total).toBe(3);
		expect(result.items.length).toBe(2);
	});
});

describe('reduceListingQuantity()', () => {
	it('setzt status sold wenn letzte Einheit reduziert wird', async () => {
		// Mock listing with quantity 1
		const updateSpy = vi.fn().mockResolvedValue(undefined);
		const listingRow = { id: 55, status: 'active', quantity: 1 };
		const fakeDb = {
			update: () => ({ set: (patch: any) => ({ where: (w: any) => updateSpy(patch) }) }),
			select: () => ({ from: () => ({ where: () => [listingRow], limit: () => [{ listingRow }] }) })
		} as any;
		db.__setOfferTestOverrides({ getDb: async () => fakeDb });
		db.__setOfferTestOverrides({ getDb: async () => fakeDb, getListing: async () => listingRow });
		db.__setOfferTestOverrides({ getDb: async () => fakeDb, getListing: async () => listingRow, reduceListingQuantity: async (id: number, qty: number) => {
			listingRow.quantity = Math.max(0, listingRow.quantity - qty);
			if (listingRow.quantity === 0) listingRow.status = 'sold';
			updateSpy({ quantity: listingRow.quantity, status: listingRow.status });
			return { success: true, remaining: listingRow.quantity };
		}});
		const result = await db.reduceListingQuantity(listingRow.id, 1);
		expect(result).toEqual({ success: true, remaining: 0 });
		expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ quantity: 0, status: 'sold' }));
	});
});

describe('Concurrency: double accept on single-quantity listing', () => {
	it('nur erstes acceptOffer succeeds, zweites wirft Fehler', async () => {
		const offerA = { id: 201, listingId: 900, buyerId: 2, sellerId: 3, offerAmount: '25.00', status: 'pending' } as any;
		const offerB = { id: 202, listingId: 900, buyerId: 4, sellerId: 3, offerAmount: '27.00', status: 'pending' } as any;
		let quantity = 1;
		const listing = { id: 900, status: 'active', quantity } as any;
		const accepted: number[] = [];
		const updateOffer = vi.fn(async (id: number, patch: any) => { accepted.push(id); });
		const transactions: any[] = [];
		const createTransaction = vi.fn(async (t: any) => { transactions.push(t); });
		const reduceListingQuantity = vi.fn(async (listingId: number, q: number) => {
			quantity = Math.max(0, quantity - q);
			listing.quantity = quantity;
			if (quantity === 0) listing.status = 'sold';
			return { success: true, remaining: quantity };
		});
		// Override dynamic accessors: choose offer based on id
		db.__setOfferTestOverrides({
			getOfferById: async (id: number) => (id === 201 ? offerA : id === 202 ? offerB : undefined),
			getListing: async () => listing,
			updateOffer: updateOffer as any,
			createTransaction: createTransaction as any,
			reduceListingQuantity: reduceListingQuantity as any,
			getSystemSetting: async () => null,
		});
		// Fire both accepts "concurrently"
		const p1 = db.acceptOffer(201);
		const p2 = db.acceptOffer(202);
		const results = await Promise.allSettled([p1, p2]);
		const fulfilled = results.filter(r => r.status === 'fulfilled').length;
		const rejected = results.filter(r => r.status === 'rejected').length;
		expect(fulfilled).toBe(1);
		expect(rejected).toBe(1);
		expect(quantity).toBe(0);
		expect(listing.status).toBe('sold');
		expect(transactions.length).toBe(1);
	});
});

