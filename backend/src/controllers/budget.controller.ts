import { Request, Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CreateExpenseInput, UpdateExpenseInput } from '../validators/budget.validator.js';

export class BudgetController {
  /**
   * GET /api/trips/:tripId/budget
   * Retrieve aggregated budget overview, category breakdown, and expenses.
   */
  static async getTripBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const budget = await BudgetService.getTripBudget(tripId, req.user.id);
      sendSuccess(res, budget, 'Trip budget retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve trip budget', 'BUDGET_FETCH_ERROR', 500);
    }
  }

  /**
   * GET /api/trips/:tripId/budget/optimize
   * Smart Budget Optimizer: suggests cheaper activity alternatives & free activities.
   */
  static async optimizeTripBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const optimization = await BudgetService.optimizeTripBudget(tripId, req.user.id);
      sendSuccess(res, optimization, 'Budget optimization suggestions retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to optimize trip budget', 'BUDGET_OPTIMIZE_ERROR', 500);
    }
  }

  /**
   * POST /api/trips/:tripId/expenses
   * Record a new expense item under a trip.
   */
  static async createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: CreateExpenseInput = req.body;
      const expense = await BudgetService.createExpense(tripId, req.user.id, input);
      sendSuccess(res, { expense }, 'Expense recorded successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to record expense', 'EXPENSE_CREATE_ERROR', 500);
    }
  }

  /**
   * GET /api/expenses/:expenseId
   * Retrieve single expense details.
   */
  static async getExpenseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { expenseId } = req.params;
      const expense = await BudgetService.getExpenseById(expenseId, req.user.id);
      sendSuccess(res, { expense }, 'Expense retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve expense', 'EXPENSE_FETCH_ERROR', 500);
    }
  }

  /**
   * PUT /api/expenses/:expenseId
   * Update an existing expense.
   */
  static async updateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { expenseId } = req.params;
      const input: UpdateExpenseInput = req.body;
      const expense = await BudgetService.updateExpense(expenseId, req.user.id, input);
      sendSuccess(res, { expense }, 'Expense updated successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to update expense', 'EXPENSE_UPDATE_ERROR', 500);
    }
  }

  /**
   * DELETE /api/expenses/:expenseId
   * Delete an expense item.
   */
  static async deleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { expenseId } = req.params;
      const result = await BudgetService.deleteExpense(expenseId, req.user.id);
      sendSuccess(res, result, 'Expense deleted successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to delete expense', 'EXPENSE_DELETE_ERROR', 500);
    }
  }
}
