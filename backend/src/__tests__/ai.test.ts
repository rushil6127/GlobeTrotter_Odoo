import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateAiItinerarySchema,
  saveAiItinerarySchema,
  aiItineraryItemDraftSchema,
} from '../validators/ai.validator.js';
import { AIService } from '../services/ai.service.js';

describe('AI Validator Schemas', () => {
  it('should validate generateAiItinerarySchema with valid inputs', async () => {
    const res = await generateAiItinerarySchema.parseAsync({
      destination: 'Goa',
      budget: 45000,
      days: 4,
      style: ['relaxing', 'beaches', 'food'],
      currency: 'INR',
      travelers: 2,
    });

    assert.strictEqual(res.destination, 'Goa');
    assert.strictEqual(res.budget, 45000);
    assert.strictEqual(res.days, 4);
    assert.deepStrictEqual(res.style, ['relaxing', 'beaches', 'food']);
    assert.strictEqual(res.currency, 'INR');
    assert.strictEqual(res.travelers, 2);
  });

  it('should reject generateAiItinerarySchema when budget is zero or negative', async () => {
    await assert.rejects(async () => {
      await generateAiItinerarySchema.parseAsync({
        budget: 0,
        days: 3,
        style: ['adventure'],
      });
    });

    await assert.rejects(async () => {
      await generateAiItinerarySchema.parseAsync({
        budget: -500,
        days: 3,
        style: ['adventure'],
      });
    });
  });

  it('should reject days less than 1 or exceeding 30', async () => {
    await assert.rejects(async () => {
      await generateAiItinerarySchema.parseAsync({
        budget: 10000,
        days: 0,
        style: ['culture'],
      });
    });

    await assert.rejects(async () => {
      await generateAiItinerarySchema.parseAsync({
        budget: 10000,
        days: 35,
        style: ['culture'],
      });
    });
  });

  it('should reject empty style array', async () => {
    await assert.rejects(async () => {
      await generateAiItinerarySchema.parseAsync({
        budget: 10000,
        days: 3,
        style: [],
      });
    });
  });

  it('should validate saveAiItinerarySchema with valid draft items', async () => {
    const res = await saveAiItinerarySchema.parseAsync({
      items: [
        {
          title: 'Scuba Diving Tour',
          dayNumber: 1,
          startTime: '09:00',
          endTime: '12:00',
          estimatedCost: 35,
        },
        {
          title: 'Beachside Seafood Dinner',
          dayNumber: 1,
          startTime: '19:00',
          endTime: '21:00',
          estimatedCost: 20,
        },
      ],
    });

    assert.strictEqual(res.items.length, 2);
    assert.strictEqual(res.items[0].title, 'Scuba Diving Tour');
  });

  it('should reject aiItineraryItemDraftSchema when endTime is before startTime', async () => {
    await assert.rejects(async () => {
      await aiItineraryItemDraftSchema.parseAsync({
        title: 'Invalid Time Test',
        dayNumber: 1,
        startTime: '15:00',
        endTime: '12:00',
      });
    });
  });
});

describe('AI Itinerary Synthesis & Rule Enforcement Engine', () => {
  it('should synthesize a complete day-wise itinerary matching requested days and budget constraints', async () => {
    const plan = await AIService.generateItinerary({
      destination: 'Goa',
      budget: 50000,
      days: 3,
      style: ['relaxing', 'beaches'],
      currency: 'INR',
      travelers: 2,
    });

    assert.strictEqual(plan.destination, 'Goa');
    assert.strictEqual(plan.daysCount, 3);
    assert.strictEqual(plan.days.length, 3);
    assert.strictEqual(plan.currency, 'INR');
    assert.ok(plan.totalEstimatedCost > 0);
    assert.ok(plan.budgetBreakdown.accommodation > 0);
    assert.ok(plan.budgetBreakdown.food > 0);
    assert.ok(plan.budgetBreakdown.activities > 0);
    assert.ok(plan.routeOrder.length >= 1);
    assert.ok(plan.suggestedActivities.length >= 3);

    // Verify day-by-day item constraints
    for (const day of plan.days) {
      assert.ok(day.dayNumber >= 1 && day.dayNumber <= 3);
      assert.ok(day.items.length >= 1);

      for (const item of day.items) {
        assert.ok(item.title && item.title.length > 0);
        assert.ok((item.estimatedCost ?? 0) >= 0);
        if (item.startTime && item.endTime) {
          assert.ok(item.startTime <= item.endTime);
        }
      }
    }
  });

  it('should dynamically pick an optimal destination when omitted', async () => {
    const plan = await AIService.generateItinerary({
      budget: 60000,
      days: 2,
      style: ['culture', 'history'],
      currency: 'EUR',
      travelers: 1,
    });

    assert.ok(plan.destination.length > 0);
    assert.strictEqual(plan.daysCount, 2);
    assert.strictEqual(plan.days.length, 2);
  });
});
