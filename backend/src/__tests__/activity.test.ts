import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getActivitiesQuerySchema,
  activityIdParamSchema,
} from '../validators/activity.validator.js';
import { SEED_CITIES } from '../config/seedData.js';

describe('Activity Validator Schemas', () => {
  it('should apply defaults for getActivities query schema', async () => {
    const result = await getActivitiesQuerySchema.parseAsync({});
    assert.strictEqual(result.page, 1);
    assert.strictEqual(result.limit, 10);
    assert.strictEqual(result.sortBy, 'name');
    assert.strictEqual(result.sortOrder, 'asc');
    assert.strictEqual(result.cityId, undefined);
    assert.strictEqual(result.category, undefined);
    assert.strictEqual(result.maxCost, undefined);
    assert.strictEqual(result.duration, undefined);
  });

  it('should parse and coerce query filters correctly', async () => {
    const result = await getActivitiesQuerySchema.parseAsync({
      cityId: 'c1000000-0000-0000-0000-000000000001',
      category: 'Sightseeing',
      maxCost: '50',
      duration: '180',
      search: 'Eiffel',
      page: '2',
      limit: '15',
      sortBy: 'estimatedCost',
      sortOrder: 'desc',
    });

    assert.strictEqual(result.cityId, 'c1000000-0000-0000-0000-000000000001');
    assert.strictEqual(result.category, 'Sightseeing');
    assert.strictEqual(result.maxCost, 50);
    assert.strictEqual(result.duration, 180);
    assert.strictEqual(result.search, 'Eiffel');
    assert.strictEqual(result.page, 2);
    assert.strictEqual(result.limit, 15);
    assert.strictEqual(result.sortBy, 'estimatedCost');
    assert.strictEqual(result.sortOrder, 'desc');
  });

  it('should reject negative maxCost', async () => {
    await assert.rejects(async () => {
      await getActivitiesQuerySchema.parseAsync({ maxCost: '-10' });
    });
  });

  it('should reject non-positive duration', async () => {
    await assert.rejects(async () => {
      await getActivitiesQuerySchema.parseAsync({ duration: '0' });
    });
    await assert.rejects(async () => {
      await getActivitiesQuerySchema.parseAsync({ duration: '-60' });
    });
  });

  it('should validate activityIdParamSchema successfully', async () => {
    const result = await activityIdParamSchema.parseAsync({ activityId: 'a1000000-0000-0000-0000-000000000001' });
    assert.strictEqual(result.activityId, 'a1000000-0000-0000-0000-000000000001');
  });

  it('should reject empty activityId in activityIdParamSchema', async () => {
    await assert.rejects(async () => {
      await activityIdParamSchema.parseAsync({ activityId: '   ' });
    });
  });
});

describe('Activity Seed Data Verification', () => {
  it('should contain activities across diverse categories in demo cities', () => {
    const allActivities = SEED_CITIES.flatMap((city) => city.activities);
    assert.ok(allActivities.length >= 40, `Expected at least 40 activities, got ${allActivities.length}`);

    const categories = new Set(allActivities.map((a) => a.category));
    assert.ok(categories.has('Sightseeing'), 'Must contain Sightseeing activities');
    assert.ok(categories.has('Culture'), 'Must contain Culture activities');
    assert.ok(categories.has('Food'), 'Must contain Food activities');
    assert.ok(categories.has('Adventure'), 'Must contain Adventure activities');

    for (const activity of allActivities) {
      assert.ok(activity.id, 'Activity must have an ID');
      assert.ok(activity.name, 'Activity must have a name');
      assert.ok(activity.description, 'Activity must have a description');
      assert.ok(activity.category, 'Activity must have a category');
      assert.ok(typeof activity.duration === 'number' && activity.duration > 0, 'Duration must be positive number');
      assert.ok(typeof activity.estimatedCost === 'number' && activity.estimatedCost >= 0, 'Estimated cost must be non-negative');
      assert.ok(activity.image, 'Activity must have an image');
    }
  });
});
