import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getCitiesQuerySchema,
  searchCitiesQuerySchema,
  cityIdParamSchema,
} from '../validators/city.validator.js';
import { SEED_CITIES } from '../config/seedData.js';

describe('City Validator Schemas', () => {
  it('should apply defaults for getCities query schema', async () => {
    const result = await getCitiesQuerySchema.parseAsync({});
    assert.strictEqual(result.page, 1);
    assert.strictEqual(result.limit, 10);
    assert.strictEqual(result.sortBy, 'name');
    assert.strictEqual(result.sortOrder, 'asc');
    assert.strictEqual(result.search, undefined);
    assert.strictEqual(result.country, undefined);
  });

  it('should coerce string numbers for page and limit in getCities query schema', async () => {
    const result = await getCitiesQuerySchema.parseAsync({
      page: '3',
      limit: '25',
      country: 'France',
      search: 'Paris',
      sortBy: 'country',
      sortOrder: 'desc',
    });
    assert.strictEqual(result.page, 3);
    assert.strictEqual(result.limit, 25);
    assert.strictEqual(result.country, 'France');
    assert.strictEqual(result.search, 'Paris');
    assert.strictEqual(result.sortBy, 'country');
    assert.strictEqual(result.sortOrder, 'desc');
  });

  it('should reject invalid page numbers or limits', async () => {
    await assert.rejects(async () => {
      await getCitiesQuerySchema.parseAsync({ page: '0' });
    });
    await assert.rejects(async () => {
      await getCitiesQuerySchema.parseAsync({ limit: '101' });
    });
  });

  it('should validate searchCities query with non-empty query', async () => {
    const result = await searchCitiesQuerySchema.parseAsync({ q: 'Tokyo' });
    assert.strictEqual(result.q, 'Tokyo');
    assert.strictEqual(result.limit, 10);
  });

  it('should reject empty search queries in searchCities', async () => {
    await assert.rejects(async () => {
      await searchCitiesQuerySchema.parseAsync({ q: '   ' });
    });
  });

  it('should validate cityIdParamSchema', async () => {
    const result = await cityIdParamSchema.parseAsync({ cityId: 'c1000000-0000-0000-0000-000000000001' });
    assert.strictEqual(result.cityId, 'c1000000-0000-0000-0000-000000000001');
  });

  it('should reject empty cityIdParamSchema', async () => {
    await assert.rejects(async () => {
      await cityIdParamSchema.parseAsync({ cityId: '' });
    });
  });
});

describe('Seed Data Verification', () => {
  it('should contain at least 15-20 curated cities', () => {
    assert.ok(SEED_CITIES.length >= 15, `Expected >= 15 cities, got ${SEED_CITIES.length}`);
  });

  it('should have valid coordinates and descriptions for each city', () => {
    for (const city of SEED_CITIES) {
      assert.ok(city.id, 'City must have an ID');
      assert.ok(city.name, 'City must have a name');
      assert.ok(city.country, 'City must have a country');
      assert.ok(city.image, 'City must have an image');
      assert.ok(typeof city.latitude === 'number', 'City latitude must be numeric');
      assert.ok(typeof city.longitude === 'number', 'City longitude must be numeric');
      assert.ok(city.activities.length > 0, `City ${city.name} must have activities`);
    }
  });
});
