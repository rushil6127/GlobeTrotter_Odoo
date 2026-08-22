import { z } from 'zod';

export const createShareLinkSchema = z.object({
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
    .optional()
    .nullable(),
  regenerate: z.boolean().optional().default(false),
});

export const shareIdParamSchema = z.object({
  shareId: z.string().trim().min(1, { message: 'shareId is required' }),
});

export const tripShareParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'tripId is required' }),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
export type ShareIdParamInput = z.infer<typeof shareIdParamSchema>;
export type TripShareParamInput = z.infer<typeof tripShareParamSchema>;
