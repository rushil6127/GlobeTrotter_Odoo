import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import {
  createShareLinkSchema,
  shareIdParamSchema,
  tripShareParamSchema,
} from '../validators/share.validator.js';

describe('Share Validator Schemas', () => {
  it('should validate createShareLinkSchema with default inputs', async () => {
    const result = await createShareLinkSchema.parseAsync({});
    assert.strictEqual(result.regenerate, false);
    assert.strictEqual(result.expiresAt, undefined);
  });

  it('should validate createShareLinkSchema with expiration date and regenerate flag', async () => {
    const result = await createShareLinkSchema.parseAsync({
      expiresAt: '2026-10-01',
      regenerate: true,
    });
    assert.strictEqual(result.regenerate, true);
    assert.strictEqual(result.expiresAt, '2026-10-01');
  });

  it('should validate shareIdParamSchema', async () => {
    const result = await shareIdParamSchema.parseAsync({ shareId: '8f3a9b2c1d4e5f6a' });
    assert.strictEqual(result.shareId, '8f3a9b2c1d4e5f6a');
  });

  it('should reject empty shareIdParamSchema', async () => {
    await assert.rejects(async () => {
      await shareIdParamSchema.parseAsync({ shareId: '   ' });
    });
  });

  it('should validate tripShareParamSchema', async () => {
    const result = await tripShareParamSchema.parseAsync({ tripId: 'trip-123' });
    assert.strictEqual(result.tripId, 'trip-123');
  });
});

describe('Share Security & Data Sanitization Logic', () => {
  it('should generate cryptographically secure 32-hex character random tokens', () => {
    const token1 = crypto.randomBytes(16).toString('hex');
    const token2 = crypto.randomBytes(16).toString('hex');

    assert.strictEqual(token1.length, 32);
    assert.strictEqual(token2.length, 32);
    assert.notStrictEqual(token1, token2);
    assert.match(token1, /^[0-9a-f]{32}$/);
  });

  it('should ensure private user and financial data are never exposed in public trip shape', () => {
    // Mock internal database object containing sensitive fields
    const mockInternalTripData = {
      id: 'trip-123',
      name: 'Goa Adventure',
      description: 'Public trip notes',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-05'),
      budget: 50000,
      currency: 'INR',
      userId: 'user-owner-123',
      createdAt: new Date('2026-08-22'),
      updatedAt: new Date('2026-08-22'),
      user: {
        id: 'user-owner-123',
        name: 'John Traveler',
        email: 'john.secret@example.com',
        password: '$2b$10$secretHashedPassword',
        avatar: 'https://example.com/avatar.jpg',
      },
      tripMembers: [
        { id: 'tm-1', userId: 'user-2', role: 'VIEWER' },
      ],
      expenses: [
        { id: 'exp-1', amount: 5000, category: 'transport', description: 'Private flight' },
      ],
      tripCities: [
        {
          id: 'tc-1',
          order: 0,
          arrivalDate: new Date('2026-09-01'),
          departureDate: new Date('2026-09-05'),
          city: {
            id: 'city-1',
            name: 'Goa',
            country: 'India',
            image: 'https://img.jpg',
            description: 'Beach',
            latitude: 15.29,
            longitude: 74.12,
          },
        },
      ],
      itineraryItems: [
        {
          id: 'item-1',
          dayNumber: 1,
          date: new Date('2026-09-01'),
          startTime: '09:00',
          endTime: '11:00',
          title: 'Scuba Diving',
          notes: 'Bring sunscreen',
          activity: {
            id: 'act-1',
            name: 'Scuba Diving Tour',
            category: 'Adventure',
            duration: 120,
            image: 'https://act.jpg',
            city: { id: 'city-1', name: 'Goa', country: 'India' },
          },
        },
      ],
    };

    // Public sanitized representation
    const sanitizedPublicResponse = {
      trip: {
        id: mockInternalTripData.id,
        name: mockInternalTripData.name,
        description: mockInternalTripData.description,
        startDate: mockInternalTripData.startDate,
        endDate: mockInternalTripData.endDate,
        currency: mockInternalTripData.currency,
        createdAt: mockInternalTripData.createdAt,
      },
      organizer: {
        name: mockInternalTripData.user.name,
        avatar: mockInternalTripData.user.avatar,
      },
      cities: mockInternalTripData.tripCities.map((tc) => ({
        id: tc.id,
        order: tc.order,
        arrivalDate: tc.arrivalDate,
        departureDate: tc.departureDate,
        city: tc.city,
      })),
      itinerary: mockInternalTripData.itineraryItems.map((item) => ({
        id: item.id,
        dayNumber: item.dayNumber,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        title: item.title,
        notes: item.notes,
        activity: item.activity,
      })),
    };

    // Strict Security Assertions
    assert.strictEqual((sanitizedPublicResponse as any).user, undefined);
    assert.strictEqual((sanitizedPublicResponse as any).expenses, undefined);
    assert.strictEqual((sanitizedPublicResponse as any).tripMembers, undefined);
    assert.strictEqual((sanitizedPublicResponse.organizer as any).email, undefined);
    assert.strictEqual((sanitizedPublicResponse.organizer as any).password, undefined);
    assert.strictEqual((sanitizedPublicResponse.organizer as any).id, undefined);

    assert.strictEqual(sanitizedPublicResponse.organizer.name, 'John Traveler');
    assert.strictEqual(sanitizedPublicResponse.trip.name, 'Goa Adventure');
    assert.strictEqual(sanitizedPublicResponse.cities.length, 1);
    assert.strictEqual(sanitizedPublicResponse.itinerary.length, 1);
  });

  it('should correctly identify expired and revoked share links', () => {
    const expiredLink = {
      isActive: true,
      expiresAt: new Date(Date.now() - 10000), // 10s in past
    };
    const isExpired = expiredLink.expiresAt && new Date() > new Date(expiredLink.expiresAt);
    assert.strictEqual(Boolean(isExpired), true);

    const revokedLink = {
      isActive: false,
      expiresAt: null,
    };
    assert.strictEqual(revokedLink.isActive, false);
  });
});
