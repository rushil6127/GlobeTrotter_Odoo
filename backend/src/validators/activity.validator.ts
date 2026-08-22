import { z } from 'zod';

export const getActivitiesQuerySchema = z.object({
  cityId: z.string().trim().optional(),
  category: z.string().trim().optional(),
  maxCost: z.coerce.number().nonnegative({ message: 'maxCost must be non-negative' }).optional(),
  duration: z.coerce.number().int().positive({ message: 'duration must be a positive integer in minutes' }).optional(),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['name', 'estimatedCost', 'duration', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const activityIdParamSchema = z.object({
  activityId: z.string().trim().min(1, { message: 'Activity ID is required' }),
});

export type GetActivitiesQueryInput = z.infer<typeof getActivitiesQuerySchema>;
export type ActivityIdParamInput = z.infer<typeof activityIdParamSchema>;
