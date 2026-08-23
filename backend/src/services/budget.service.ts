import { prisma } from '../config/prisma.js';
import { CreateExpenseInput, UpdateExpenseInput, EXPENSE_CATEGORIES } from '../validators/budget.validator.js';
import { SEED_CITIES } from '../config/seedData.js';

export class BudgetService {
  /**
   * Helper to verify trip existence and user view permissions (OWNER, EDITOR, VIEWER).
   */
  private static async verifyTripViewPermission(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tripMembers: true },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    const isOwner = trip.userId === userId;
    const isMember = trip.tripMembers.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      const error: any = new Error('Unauthorized to view this trip budget');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Helper to verify trip existence and user edit permissions (OWNER or EDITOR).
   */
  private static async verifyTripEditPermission(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tripMembers: true },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    const isOwner = trip.userId === userId;
    const isEditor = trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to modify this trip expenses');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Calculates comprehensive budget metrics, category totals, remaining budget, and over-budget status.
   */
  static async getTripBudget(tripId: string, userId: string) {
    const trip = await this.verifyTripViewPermission(tripId, userId);

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: 'desc' },
    });

    // Initialize all categories to 0
    const categories: Record<string, number> = {
      transport: 0,
      food: 0,
      activities: 0,
      accommodation: 0,
      shopping: 0,
      other: 0,
    };

    let totalSpent = 0;
    for (const expense of expenses) {
      totalSpent += expense.amount;
      const cat = expense.category.toLowerCase();
      if (categories[cat] !== undefined) {
        categories[cat] += expense.amount;
      } else {
        categories.other += expense.amount;
      }
    }

    // Round category totals
    for (const key of Object.keys(categories)) {
      categories[key] = Math.round(categories[key] * 100) / 100;
    }

    const spent = Math.round(totalSpent * 100) / 100;
    const remaining = Math.round((trip.budget - totalSpent) * 100) / 100;
    const overBudget = totalSpent > trip.budget;
    const overBudgetAmount = overBudget ? Math.round((totalSpent - trip.budget) * 100) / 100 : 0;
    const percentageUsed =
      trip.budget > 0
        ? Math.round((totalSpent / trip.budget) * 10000) / 100
        : totalSpent > 0
        ? 100
        : 0;

    // Calculate trip duration
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const tripDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const averagePerDay = Math.round((totalSpent / tripDays) * 100) / 100;
    const dailyBudgetAllowance = trip.budget > 0 ? Math.round((trip.budget / tripDays) * 100) / 100 : 0;

    return {
      tripId: trip.id,
      tripName: trip.name,
      currency: trip.currency,
      budget: trip.budget,
      spent,
      remaining,
      percentageUsed,
      overBudget,
      overBudgetAmount,
      tripDays,
      averagePerDay,
      dailyBudgetAllowance,
      categories,
      expensesCount: expenses.length,
      expenses,
    };
  }

  /**
   * Log a new expense against a trip.
   */
  static async createExpense(tripId: string, userId: string, input: CreateExpenseInput) {
    await this.verifyTripEditPermission(tripId, userId);

    const expenseDate = input.date ? new Date(input.date) : new Date();

    const expense = await prisma.expense.create({
      data: {
        tripId,
        amount: input.amount,
        category: input.category,
        date: expenseDate,
        description: input.description || null,
      },
    });

    return expense;
  }

  /**
   * Retrieve a single expense by ID.
   */
  static async getExpenseById(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        trip: {
          include: { tripMembers: true },
        },
      },
    });

    if (!expense) {
      const error: any = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    const isOwner = expense.trip.userId === userId;
    const isMember = expense.trip.tripMembers.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      const error: any = new Error('Unauthorized to view this expense');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const { trip, ...rest } = expense;
    return rest;
  }

  /**
   * Update an existing expense item.
   */
  static async updateExpense(expenseId: string, userId: string, input: UpdateExpenseInput) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        trip: {
          include: { tripMembers: true },
        },
      },
    });

    if (!expense) {
      const error: any = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    const isOwner = expense.trip.userId === userId;
    const isEditor = expense.trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to modify this expense');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
    });

    return updatedExpense;
  }

  /**
   * Delete an expense item.
   */
  static async deleteExpense(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        trip: {
          include: { tripMembers: true },
        },
      },
    });

    if (!expense) {
      const error: any = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    const isOwner = expense.trip.userId === userId;
    const isEditor = expense.trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to delete this expense');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return {
      id: expenseId,
      tripId: expense.tripId,
      amount: expense.amount,
      category: expense.category,
    };
  }

  /**
   * GET /api/trips/:tripId/budget/optimize
   * Smart Budget Optimizer: analyzes trip expenses and itinerary items to suggest cheaper activity alternatives
   * and complimentary free activities to re-balance over-budget trips.
   */
  static async optimizeTripBudget(tripId: string, userId: string) {
    const budgetOverview = await this.getTripBudget(tripId, userId);
    const { budget, spent, currency, overBudget, overBudgetAmount } = budgetOverview;

    // Fetch all itinerary items and their linked activities
    const itineraryItems = await prisma.itineraryItem.findMany({
      where: { tripId },
      include: {
        activity: {
          include: { city: true },
        },
      },
      orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }],
    });

    // Fetch trip cities to know which destinations are part of this trip
    const tripCities = await prisma.tripCity.findMany({
      where: { tripId },
      include: { city: true },
      orderBy: { order: 'asc' },
    });

    const cityIds = tripCities.map((tc) => tc.cityId);
    const scheduledActivityIds = itineraryItems
      .map((item) => item.activityId)
      .filter((id): id is string => Boolean(id));

    const suggestions: Array<{
      itineraryItemId: string;
      dayNumber: number;
      currentActivity: string;
      currentCost: number;
      category: string;
      city: {
        id: string;
        name: string;
        country: string;
      };
      alternative: {
        activityId: string;
        name: string;
        description: string | null;
        category: string;
        duration: number;
        cost: number;
        image: string | null;
      };
      potentialSavings: number;
    }> = [];

    // For each itinerary item that has a cost, check for cheaper alternatives in the same city and category
    for (const item of itineraryItems) {
      const currentCost = item.estimatedCost || item.activity?.estimatedCost || 0;
      if (currentCost <= 0) continue;

      const targetCityId = item.activity?.cityId || (cityIds.length > 0 ? cityIds[0] : null);
      const targetCategory = item.activity?.category || 'Sightseeing';

      if (!targetCityId) continue;

      let cheaperActivities: Array<any> = [];

      if (process.env.DATABASE_URL) {
        try {
          cheaperActivities = await prisma.activity.findMany({
            where: {
              cityId: targetCityId,
              category: { equals: targetCategory },
              estimatedCost: { lt: currentCost },
              id: { notIn: scheduledActivityIds },
            },
            orderBy: { estimatedCost: 'asc' },
            take: 2,
            include: { city: true },
          });
        } catch {
          // DB error fallback
        }
      }

      // Fallback from SEED_CITIES if needed
      if (cheaperActivities.length === 0) {
        const seedCity = SEED_CITIES.find((c) => c.id === targetCityId || c.name === item.activity?.city?.name);
        if (seedCity) {
          cheaperActivities = seedCity.activities
            .filter(
              (a) =>
                a.category.toLowerCase() === targetCategory.toLowerCase() &&
                a.estimatedCost < currentCost &&
                !scheduledActivityIds.includes(a.id)
            )
            .slice(0, 2)
            .map((a) => ({
              ...a,
              city: { id: seedCity.id, name: seedCity.name, country: seedCity.country },
            }));
        }
      }

      for (const alt of cheaperActivities) {
        const potentialSavings = Math.round((currentCost - alt.estimatedCost) * 100) / 100;
        suggestions.push({
          itineraryItemId: item.id,
          dayNumber: item.dayNumber,
          currentActivity: item.title,
          currentCost,
          category: alt.category,
          city: {
            id: alt.city.id,
            name: alt.city.name,
            country: alt.city.country,
          },
          alternative: {
            activityId: alt.id,
            name: alt.name,
            description: alt.description || null,
            category: alt.category,
            duration: alt.duration,
            cost: alt.estimatedCost,
            image: alt.image || null,
          },
          potentialSavings,
        });
      }
    }

    // Find free or very-low-cost activities in the trip's cities that are not yet in the itinerary
    let freeActivitiesFromDb: Array<any> = [];

    if (process.env.DATABASE_URL) {
      try {
        freeActivitiesFromDb = await prisma.activity.findMany({
          where: {
            cityId: cityIds.length > 0 ? { in: cityIds } : undefined,
            estimatedCost: { lte: 0 },
            id: { notIn: scheduledActivityIds },
          },
          include: { city: true },
          take: 5,
        });
      } catch {
        // Fallback
      }
    }

    if (freeActivitiesFromDb.length === 0 && cityIds.length > 0) {
      for (const cId of cityIds) {
        const seedCity = SEED_CITIES.find((c) => c.id === cId);
        if (seedCity) {
          const freeSeedActs = seedCity.activities
            .filter((a) => a.estimatedCost <= 0 && !scheduledActivityIds.includes(a.id))
            .map((a) => ({
              ...a,
              city: { id: seedCity.id, name: seedCity.name, country: seedCity.country },
            }));
          freeActivitiesFromDb.push(...freeSeedActs);
        }
      }
    }

    const freeAlternatives = freeActivitiesFromDb.map((act) => ({
      activityId: act.id,
      name: act.name,
      description: act.description || null,
      category: act.category,
      duration: act.duration,
      cost: act.estimatedCost,
      city: {
        id: act.city.id,
        name: act.city.name,
        country: act.city.country,
      },
      image: act.image || null,
    }));

    // Calculate maximum potential savings by picking the best alternative per distinct itinerary item
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
    totalPotentialSavings = Math.round(totalPotentialSavings * 100) / 100;

    const projectedSpentWithOptimizations = Math.max(
      0,
      Math.round((spent - totalPotentialSavings) * 100) / 100
    );
    const canResolveOverBudget = overBudget ? projectedSpentWithOptimizations <= budget : true;

    return {
      tripId,
      tripName: budgetOverview.tripName,
      currency,
      budget,
      currentSpent: spent,
      isOverBudget: overBudget,
      overBudgetAmount,
      totalPotentialSavings,
      projectedSpentWithOptimizations,
      canResolveOverBudget,
      suggestionsCount: suggestions.length,
      suggestions,
      freeAlternativesCount: freeAlternatives.length,
      freeAlternatives,
    };
  }
}
