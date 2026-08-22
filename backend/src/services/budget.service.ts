import { prisma } from '../config/prisma.js';
import { CreateExpenseInput, UpdateExpenseInput, EXPENSE_CATEGORIES } from '../validators/budget.validator.js';

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
}
