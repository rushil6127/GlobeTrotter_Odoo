import { z } from 'zod';

export const voteActivitySchema = z.object({
  voteType: z
    .enum(['UPVOTE', 'DOWNVOTE', 'UP', 'DOWN'])
    .default('UPVOTE')
    .transform((val) => (val === 'UP' ? 'UPVOTE' : val === 'DOWN' ? 'DOWNVOTE' : val)),
});

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, { message: 'Comment text cannot be empty' }).max(2000),
  itineraryItemId: z.string().trim().optional().nullable(),
});

export const getCommentsQuerySchema = z.object({
  itineraryItemId: z.string().trim().optional(),
});

export const suggestActivitySchema = z.object({
  notes: z.string().trim().max(1000).optional().nullable(),
  dayNumber: z.number().int().positive({ message: 'dayNumber must be a positive integer' }).optional(),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
    .optional()
    .nullable(),
});

export const tripActivityParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'tripId is required' }),
  activityId: z.string().trim().min(1, { message: 'activityId is required' }),
});

export const tripParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'tripId is required' }),
});

export type VoteActivityInput = z.infer<typeof voteActivitySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type GetCommentsQueryInput = z.infer<typeof getCommentsQuerySchema>;
export type SuggestActivityInput = z.infer<typeof suggestActivitySchema>;
export type TripActivityParamInput = z.infer<typeof tripActivityParamSchema>;
export type TripParamInput = z.infer<typeof tripParamSchema>;
