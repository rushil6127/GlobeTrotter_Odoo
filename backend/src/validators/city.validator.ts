import { z } from 'zod';

export const getCitiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  country: z.string().trim().optional(),
  sortBy: z.enum(['name', 'country', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const searchCitiesQuerySchema = z.object({
  q: z.string().trim().min(1, { message: 'Search query parameter "q" is required and cannot be empty' }),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const cityIdParamSchema = z.object({
  cityId: z.string().trim().min(1, { message: 'City ID is required' }),
});

export type GetCitiesQueryInput = z.infer<typeof getCitiesQuerySchema>;
export type SearchCitiesQueryInput = z.infer<typeof searchCitiesQuerySchema>;
export type CityIdParamInput = z.infer<typeof cityIdParamSchema>;
