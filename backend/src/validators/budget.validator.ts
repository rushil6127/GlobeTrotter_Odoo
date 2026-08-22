import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'transport',
  'food',
  'activities',
  'accommodation',
  'shopping',
  'other',
] as const;

export type ExpenseCategoryType = (typeof EXPENSE_CATEGORIES)[number];

export const normalizeExpenseCategory = (category: string): string => {
  const lower = category.trim().toLowerCase();
  if (lower === 'miscellaneous') return 'other';
  if (lower === 'activity') return 'activities';
  return lower;
};

export const createExpenseSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be a positive number greater than 0' }),
  category: z
    .string()
    .trim()
    .min(1, { message: 'Category is required' })
    .transform(normalizeExpenseCategory)
    .refine(
      (val) => EXPENSE_CATEGORIES.includes(val as any),
      {
        message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      }
    ),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
    .optional(),
  description: z.string().max(500).optional().nullable(),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be a positive number greater than 0' }).optional(),
  category: z
    .string()
    .trim()
    .min(1)
    .transform(normalizeExpenseCategory)
    .refine(
      (val) => EXPENSE_CATEGORIES.includes(val as any),
      {
        message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      }
    )
    .optional(),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
    .optional(),
  description: z.string().max(500).optional().nullable(),
});

export const expenseIdParamSchema = z.object({
  expenseId: z.string().trim().min(1, { message: 'expenseId is required' }),
});

export const tripBudgetParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'tripId is required' }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseIdParamInput = z.infer<typeof expenseIdParamSchema>;
export type TripBudgetParamInput = z.infer<typeof tripBudgetParamSchema>;
