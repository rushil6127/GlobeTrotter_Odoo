import { z } from 'zod';

export const createTripSchema = z
  .object({
    name: z.string().min(1, { message: 'Trip name is required' }).max(150),
    description: z.string().max(1000).optional().nullable(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD or ISO string')),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD or ISO string')),
    budget: z.number().nonnegative({ message: 'Budget must be a non-negative number' }).default(0),
    currency: z.string().min(1).max(10).default('INR'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    },
    {
      message: 'endDate must be on or after startDate',
      path: ['endDate'],
    }
  );

export const updateTripSchema = z
  .object({
    name: z.string().min(1, { message: 'Trip name cannot be empty' }).max(150).optional(),
    description: z.string().max(1000).optional().nullable(),
    startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD or ISO string')).optional(),
    endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD or ISO string')).optional(),
    budget: z.number().nonnegative({ message: 'Budget must be a non-negative number' }).optional(),
    currency: z.string().min(1).max(10).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
      }
      return true;
    },
    {
      message: 'endDate must be on or after startDate',
      path: ['endDate'],
    }
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
