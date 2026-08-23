/**
 * GlobeTrotter — Budget & Expenses API Module
 *
 * Covers GET /api/trips/:tripId/budget, GET /api/trips/:tripId/budget/optimize,
 * POST /api/trips/:tripId/expenses, GET/PUT/DELETE /api/expenses/:expenseId
 * Contract from: backend/FRONTEND_INTEGRATION.md §3.8
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ExpenseCategory =
  | "transport"
  | "food"
  | "accommodation"
  | "activities"
  | "shopping"
  | "other";

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  tripId: string;
  tripName: string;
  currency: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  overBudget: boolean;
  overBudgetAmount: number;
  tripDays: number;
  averagePerDay: number;
  dailyBudgetAllowance: number;
  categories: Record<ExpenseCategory, number>;
  expensesCount: number;
  expenses: Expense[];
}

export interface CreateExpenseInput {
  amount: number;
  category: ExpenseCategory | string;
  date?: string;
  description?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  category?: ExpenseCategory | string;
  date?: string;
  description?: string;
}

export interface OptimizationSuggestion {
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
}

export interface FreeAlternativeActivity {
  activityId: string;
  name: string;
  description: string | null;
  category: string;
  duration: number;
  cost: number;
  city: {
    id: string;
    name: string;
    country: string;
  };
  image: string | null;
}

export interface BudgetOptimizationResponse {
  tripId: string;
  tripName: string;
  currency: string;
  budget: number;
  currentSpent: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  totalPotentialSavings: number;
  projectedSpentWithOptimizations: number;
  canResolveOverBudget: boolean;
  suggestionsCount: number;
  suggestions: OptimizationSuggestion[];
  freeAlternativesCount: number;
  freeAlternatives: FreeAlternativeActivity[];
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

/** GET /api/trips/:tripId/budget */
export async function getTripBudget(tripId: string): Promise<BudgetSummary> {
  const res = await apiGet<BudgetSummary | { budgetSummary: BudgetSummary }>(
    `/trips/${tripId}/budget`
  );
  if ("budgetSummary" in res && res.budgetSummary) {
    return res.budgetSummary;
  }
  return res as BudgetSummary;
}

/** GET /api/trips/:tripId/budget/optimize */
export async function getBudgetOptimization(
  tripId: string
): Promise<BudgetOptimizationResponse> {
  return apiGet<BudgetOptimizationResponse>(`/trips/${tripId}/budget/optimize`);
}

/** POST /api/trips/:tripId/expenses */
export async function createExpense(
  tripId: string,
  data: CreateExpenseInput
): Promise<Expense> {
  const res = await apiPost<{ expense: Expense }>(
    `/trips/${tripId}/expenses`,
    data
  );
  return res.expense;
}

/** GET /api/expenses/:expenseId */
export async function getExpense(expenseId: string): Promise<Expense> {
  const res = await apiGet<{ expense: Expense }>(`/expenses/${expenseId}`);
  return res.expense;
}

/** PUT /api/expenses/:expenseId */
export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseInput
): Promise<Expense> {
  const res = await apiPut<{ expense: Expense }>(
    `/expenses/${expenseId}`,
    data
  );
  return res.expense;
}

/** DELETE /api/expenses/:expenseId */
export async function deleteExpense(
  expenseId: string
): Promise<{ id: string; tripId: string; amount: number; category: string }> {
  return apiDelete<{ id: string; tripId: string; amount: number; category: string }>(
    `/expenses/${expenseId}`
  );
}
