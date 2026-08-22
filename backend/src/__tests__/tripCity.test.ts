import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  addCityToTripSchema,
  reorderTripCitiesSchema,
  tripCityParamSchema,
  tripIdParamSchema,
} from '../validators/tripCity.validator.js';

describe('TripCity Validator Schemas', () => {
  it('should validate addCityToTripSchema with valid cityId', async () => {
    const result = await addCityToTripSchema.parseAsync({
      cityId: 'c1000000-0000-0000-0000-000000000001',
      order: 1,
      arrivalDate: '2026-09-01',
      departureDate: '2026-09-05',
    });

    assert.strictEqual(result.cityId, 'c1000000-0000-0000-0000-000000000001');
    assert.strictEqual(result.order, 1);
    assert.strictEqual(result.arrivalDate, '2026-09-01');
    assert.strictEqual(result.departureDate, '2026-09-05');
  });

  it('should reject addCityToTripSchema when cityId is empty', async () => {
    await assert.rejects(async () => {
      await addCityToTripSchema.parseAsync({ cityId: '' });
    });
  });

  it('should reject addCityToTripSchema when departureDate is before arrivalDate', async () => {
    await assert.rejects(async () => {
      await addCityToTripSchema.parseAsync({
        cityId: 'c1000000-0000-0000-0000-000000000001',
        arrivalDate: '2026-09-05',
        departureDate: '2026-09-01',
      });
    });
  });

  it('should validate reorderTripCitiesSchema with cityOrders array', async () => {
    const result = await reorderTripCitiesSchema.parseAsync({
      cityOrders: [
        { cityId: 'city-1', order: 0 },
        { cityId: 'city-2', order: 1 },
      ],
    });

    assert.ok(result.cityOrders);
    assert.strictEqual(result.cityOrders.length, 2);
    assert.strictEqual(result.cityOrders[0].cityId, 'city-1');
    assert.strictEqual(result.cityOrders[0].order, 0);
  });

  it('should validate reorderTripCitiesSchema with cityIds sequence array', async () => {
    const result = await reorderTripCitiesSchema.parseAsync({
      cityIds: ['city-2', 'city-1'],
    });

    assert.ok(result.cityIds);
    assert.strictEqual(result.cityIds.length, 2);
    assert.strictEqual(result.cityIds[0], 'city-2');
  });

  it('should reject duplicate city IDs in reorderTripCitiesSchema', async () => {
    await assert.rejects(async () => {
      await reorderTripCitiesSchema.parseAsync({
        cityIds: ['city-1', 'city-1'],
      });
    });

    await assert.rejects(async () => {
      await reorderTripCitiesSchema.parseAsync({
        cityOrders: [
          { cityId: 'city-1', order: 0 },
          { cityId: 'city-1', order: 1 },
        ],
      });
    });
  });

  it('should reject empty payload in reorderTripCitiesSchema', async () => {
    await assert.rejects(async () => {
      await reorderTripCitiesSchema.parseAsync({});
    });
  });

  it('should validate tripCityParamSchema', async () => {
    const result = await tripCityParamSchema.parseAsync({
      tripId: 'trip-123',
      cityId: 'city-456',
    });
    assert.strictEqual(result.tripId, 'trip-123');
    assert.strictEqual(result.cityId, 'city-456');
  });

  it('should validate tripIdParamSchema', async () => {
    const result = await tripIdParamSchema.parseAsync({
      tripId: 'trip-123',
    });
    assert.strictEqual(result.tripId, 'trip-123');
  });
});
