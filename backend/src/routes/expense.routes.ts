import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import {
  updateExpenseSchema,
  expenseIdParamSchema,
} from '../validators/budget.validator.js';

const router = Router();

// All expense routes require authentication
router.use(authenticate);

// GET /api/expenses/:expenseId - Get single expense
router.get('/:expenseId', validateParams(expenseIdParamSchema), BudgetController.getExpenseById);

// PUT /api/expenses/:expenseId - Update expense
router.put(
  '/:expenseId',
  validateParams(expenseIdParamSchema),
  validateBody(updateExpenseSchema),
  BudgetController.updateExpense
);

// DELETE /api/expenses/:expenseId - Delete expense
router.delete('/:expenseId', validateParams(expenseIdParamSchema), BudgetController.deleteExpense);

export default router;
