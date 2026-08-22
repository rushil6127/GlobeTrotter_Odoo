import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParamSchema,
  tripBudgetParamSchema,
  EXPENSE_CATEGORIES,
} from '../validators/budget.validator.js';
import { SEED_CITIES } from '../config/seedData.js';

describe('Budget & Expense Validator Schemas', () => {
  it('should validate createExpenseSchema with valid inputs and normalize category', async () => {
    const result = await createExpenseSchema.parseAsync({
      amount: 150.5,
      category: 'Food',
      description: 'Dinner at Le Bistrot',
      date: '2026-09-02',
    });

    assert.strictEqual(result.amount, 150.5);
    assert.strictEqual(result.category, 'food');
    assert.strictEqual(result.description, 'Dinner at Le Bistrot');
    assert.strictEqual(result.date, '2026-09-02');
  });

  it('should normalize miscellaneous category to other', async () => {
    const result = await createExpenseSchema.parseAsync({
      amount: 20,
      category: 'miscellaneous',
    });
    assert.strictEqual(result.category, 'other');
  });

  it('should normalize activity category to activities', async () => {
    const result = await createExpenseSchema.parseAsync({
      amount: 45,
      category: 'activity',
    });
    assert.strictEqual(result.category, 'activities');
  });

  it('should reject non-positive or negative amounts', async () => {
    await assert.rejects(async () => {
      await createExpenseSchema.parseAsync({
        amount: 0,
        category: 'food',
      });
    });

    await assert.rejects(async () => {
      await createExpenseSchema.parseAsync({
        amount: -50,
        category: 'food',
      });
    });
  });

  it('should reject invalid expense categories', async () => {
    await assert.rejects(async () => {
      await createExpenseSchema.parseAsync({
        amount: 100,
        category: 'cryptocurrency',
      });
    });
  });

  it('should validate updateExpenseSchema with partial fields', async () => {
    const result = await updateExpenseSchema.parseAsync({
      amount: 80,
      description: 'Updated lunch cost',
    });

    assert.strictEqual(result.amount, 80);
    assert.strictEqual(result.description, 'Updated lunch cost');
    assert.strictEqual(result.category, undefined);
  });

  it('should validate expenseIdParamSchema', async () => {
    const result = await expenseIdParamSchema.parseAsync({ expenseId: 'exp-123' });
    assert.strictEqual(result.expenseId, 'exp-123');
  });

  it('should validate tripBudgetParamSchema', async () => {
    const result = await tripBudgetParamSchema.parseAsync({ tripId: 'trip-123' });
    assert.strictEqual(result.tripId, 'trip-123');
  });
});

describe('Budget Calculation Logic', () => {
  it('should accurately calculate budget metrics for within-budget trip', () => {
    const tripBudget = 50000;
    const startDate = new Date('2026-09-01T00:00:00.000Z');
    const endDate = new Date('2026-09-05T00:00:00.000Z'); // 5 days
    const tripDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    assert.strictEqual(tripDays, 5);

    const mockExpenses = [
      { amount: 5000, category: 'transport' },
      { amount: 7000, category: 'food' },
      { amount: 10000, category: 'activities' },
      { amount: 3000, category: 'accommodation' },
    ];

    let totalSpent = 0;
    const categories: Record<string, number> = {
      transport: 0,
      food: 0,
      activities: 0,
      accommodation: 0,
      shopping: 0,
      other: 0,
    };

    for (const exp of mockExpenses) {
      totalSpent += exp.amount;
      categories[exp.category] += exp.amount;
    }

    const spent = Math.round(totalSpent * 100) / 100;
    const remaining = Math.round((tripBudget - totalSpent) * 100) / 100;
    const overBudget = totalSpent > tripBudget;
    const averagePerDay = Math.round((totalSpent / tripDays) * 100) / 100;

    assert.strictEqual(spent, 25000);
    assert.strictEqual(remaining, 25000);
    assert.strictEqual(overBudget, false);
    assert.strictEqual(averagePerDay, 5000);
    assert.strictEqual(categories.transport, 5000);
    assert.strictEqual(categories.food, 7000);
    assert.strictEqual(categories.activities, 10000);
    assert.strictEqual(categories.accommodation, 3000);
    assert.strictEqual(categories.shopping, 0);
  });

  it('should accurately calculate over-budget state and overBudgetAmount', () => {
    const tripBudget = 1000;
    const mockExpenses = [
      { amount: 600, category: 'accommodation' },
      { amount: 500, category: 'food' },
    ];

    const totalSpent = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
    const overBudget = totalSpent > tripBudget;
    const overBudgetAmount = overBudget ? totalSpent - tripBudget : 0;
    const remaining = tripBudget - totalSpent;

    assert.strictEqual(totalSpent, 1100);
    assert.strictEqual(overBudget, true);
    assert.strictEqual(overBudgetAmount, 100);
    assert.strictEqual(remaining, -100);
  });
});

describe('Smart Budget Optimizer Suggestions Logic', () => {
  it('should suggest cheaper alternatives in same category and calculate potential savings', () => {
    const tripBudget = 40000;
    const currentSpent = 45000;
    const overBudgetAmount = currentSpent - tripBudget; // 5000 over budget

    const mockScheduledItems = [
      {
        id: 'item-1',
        title: 'VIP Scuba Diving Experience',
        category: 'Adventure',
        cost: 4500,
        cityId: 'city-goa',
      },
      {
        id: 'item-2',
        title: 'Helicopter City Flight',
        category: 'Sightseeing',
        cost: 8000,
        cityId: 'city-goa',
      },
    ];

    const mockAvailableActivities = [
      {
        id: 'act-cheaper-1',
        name: 'Standard Snorkeling Tour',
        category: 'Adventure',
        estimatedCost: 1500,
        cityId: 'city-goa',
      },
      {
        id: 'act-cheaper-2',
        name: 'Mandovi River Sunset Cruise',
        category: 'Sightseeing',
        estimatedCost: 600,
        cityId: 'city-goa',
      },
      {
        id: 'act-free-1',
        name: 'Anjuna Beach Sunset Walk',
        category: 'Sightseeing',
        estimatedCost: 0,
        cityId: 'city-goa',
      },
    ];

    const suggestions: Array<{
      itineraryItemId: string;
      currentCost: number;
      alternativeCost: number;
      potentialSavings: number;
    }> = [];

    for (const item of mockScheduledItems) {
      const cheaper = mockAvailableActivities.filter(
        (a) => a.category === item.category && a.estimatedCost < item.cost
      );

      for (const alt of cheaper) {
        suggestions.push({
          itineraryItemId: item.id,
          currentCost: item.cost,
          alternativeCost: alt.estimatedCost,
          potentialSavings: item.cost - alt.estimatedCost,
        });
      }
    }

    assert.strictEqual(suggestions.length, 3);
    assert.strictEqual(suggestions[0].potentialSavings, 3000); // 4500 - 1500 (Adventure)
    assert.strictEqual(suggestions[1].potentialSavings, 7400); // 8000 - 600 (Sightseeing Alt 1)
    assert.strictEqual(suggestions[2].potentialSavings, 8000); // 8000 - 0 (Sightseeing Alt 2 Free)

    // Best savings per item: item-1 = 3000, item-2 = 8000
    const maxSavingsPerItem = new Map<string, number>();
    for (const s of suggestions) {
      const existing = maxSavingsPerItem.get(s.itineraryItemId) || 0;
      if (s.potentialSavings > existing) {
        maxSavingsPerItem.set(s.itineraryItemId, s.potentialSavings);
      }
    }

    let totalPotentialSavings = 0;
    for (const savings of maxSavingsPerItem.values()) {
      totalPotentialSavings += savings;
    }
    assert.strictEqual(totalPotentialSavings, 11000); // 3000 + 8000

    const projectedSpent = currentSpent - totalPotentialSavings;
    assert.strictEqual(projectedSpent, 34000);
    assert.strictEqual(projectedSpent <= tripBudget, true); // Over-budget resolved!
  });
});
