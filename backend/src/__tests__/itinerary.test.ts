import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createItineraryItemSchema,
  updateItineraryItemSchema,
  reorderItinerarySchema,
  getTripItineraryQuerySchema,
  itineraryItemIdParamSchema,
} from '../validators/itinerary.validator.js';
import { ItineraryService } from '../services/itinerary.service.js';

describe('Itinerary Validator Schemas', () => {
  it('should validate createItineraryItemSchema with valid inputs', async () => {
    const result = await createItineraryItemSchema.parseAsync({
      title: 'Eiffel Tower Visit',
      date: '2026-09-02',
      startTime: '09:30',
      endTime: '12:00',
      estimatedCost: 35,
      notes: 'Remember tickets and camera',
    });

    assert.strictEqual(result.title, 'Eiffel Tower Visit');
    assert.strictEqual(result.date, '2026-09-02');
    assert.strictEqual(result.startTime, '09:30');
    assert.strictEqual(result.endTime, '12:00');
    assert.strictEqual(result.estimatedCost, 35);
  });

  it('should reject createItineraryItemSchema when endTime is before startTime', async () => {
    await assert.rejects(async () => {
      await createItineraryItemSchema.parseAsync({
        title: 'Invalid Time Test',
        date: '2026-09-02',
        startTime: '14:00',
        endTime: '11:00',
      });
    });
  });

  it('should reject invalid time formats', async () => {
    await assert.rejects(async () => {
      await createItineraryItemSchema.parseAsync({
        title: 'Bad Time Format',
        date: '2026-09-02',
        startTime: '9:30 AM',
      });
    });
  });

  it('should reject negative estimatedCost', async () => {
    await assert.rejects(async () => {
      await createItineraryItemSchema.parseAsync({
        title: 'Negative Cost Test',
        date: '2026-09-02',
        estimatedCost: -50,
      });
    });
  });

  it('should validate updateItineraryItemSchema with partial fields', async () => {
    const result = await updateItineraryItemSchema.parseAsync({
      title: 'Updated Title',
      startTime: '10:00',
      endTime: '11:30',
    });

    assert.strictEqual(result.title, 'Updated Title');
    assert.strictEqual(result.startTime, '10:00');
    assert.strictEqual(result.endTime, '11:30');
  });

  it('should validate reorderItinerarySchema with itemOrders', async () => {
    const result = await reorderItinerarySchema.parseAsync({
      itemOrders: [
        { itemId: 'item-1', order: 0, dayNumber: 1 },
        { itemId: 'item-2', order: 1, dayNumber: 1 },
      ],
    });

    assert.ok(result.itemOrders);
    assert.strictEqual(result.itemOrders.length, 2);
  });

  it('should reject duplicate itemIds in reorderItinerarySchema', async () => {
    await assert.rejects(async () => {
      await reorderItinerarySchema.parseAsync({
        itemIds: ['item-1', 'item-1'],
      });
    });
  });

  it('should validate itineraryItemIdParamSchema', async () => {
    const result = await itineraryItemIdParamSchema.parseAsync({ itemId: 'item-123' });
    assert.strictEqual(result.itemId, 'item-123');
  });

  it('should validate getTripItineraryQuerySchema', async () => {
    const result = await getTripItineraryQuerySchema.parseAsync({
      dayNumber: '2',
      date: '2026-09-03',
    });
    assert.strictEqual(result.dayNumber, 2);
    assert.strictEqual(result.date, '2026-09-03');
  });
});

describe('Itinerary Date Window Validation (Trip Boundary Check)', () => {
  const trip = {
    startDate: new Date('2026-09-01T00:00:00.000Z'),
    endDate: new Date('2026-09-10T23:59:59.999Z'),
  };

  it('should correctly accept date on the exact trip start date and return day 1', () => {
    const day = ItineraryService.validateDateWithinTrip('2026-09-01', trip);
    assert.strictEqual(day, 1);
  });

  it('should correctly accept date in the middle of trip and return appropriate day number', () => {
    const day = ItineraryService.validateDateWithinTrip('2026-09-05', trip);
    assert.strictEqual(day, 5);
  });

  it('should correctly accept date on the exact trip end date and return day 10', () => {
    const day = ItineraryService.validateDateWithinTrip('2026-09-10', trip);
    assert.strictEqual(day, 10);
  });

  it('should reject date before trip start date', () => {
    assert.throws(
      () => {
        ItineraryService.validateDateWithinTrip('2026-08-31', trip);
      },
      (err: any) => {
        return err.code === 'INVALID_ITINERARY_DATE' && err.statusCode === 400;
      }
    );
  });

  it('should reject date after trip end date', () => {
    assert.throws(
      () => {
        ItineraryService.validateDateWithinTrip('2026-09-11', trip);
      },
      (err: any) => {
        return err.code === 'INVALID_ITINERARY_DATE' && err.statusCode === 400;
      }
    );
  });
});
