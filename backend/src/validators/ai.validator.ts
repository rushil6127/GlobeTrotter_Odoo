import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const generateAiItinerarySchema = z.object({
  destination: z.string().trim().max(100).optional(),
  budget: z.number().positive({ message: 'Budget must be a positive number greater than 0' }),
  days: z
    .number()
    .int()
    .min(1, { message: 'Days must be at least 1' })
    .max(30, { message: 'Days cannot exceed 30' }),
  style: z
    .array(z.string().trim().min(1))
    .min(1, { message: 'At least one travel style tag is required (e.g. adventure, relaxing, culture, food)' }),
  currency: z.string().trim().min(1).max(10).default('INR'),
  travelers: z.number().int().positive({ message: 'travelers must be at least 1' }).default(1),
});

export const aiItineraryItemDraftSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Title is required' }).max(200),
    dayNumber: z.number().int().positive({ message: 'dayNumber must be a positive integer' }),
    date: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
      .optional(),
    startTime: z.string().regex(timeRegex, 'startTime must be in HH:mm format (24h)').optional().nullable(),
    endTime: z.string().regex(timeRegex, 'endTime must be in HH:mm format (24h)').optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    estimatedCost: z.number().nonnegative({ message: 'estimatedCost must be non-negative' }).optional(),
    activityId: z.string().trim().optional().nullable(),
    order: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime <= data.endTime;
      }
      return true;
    },
    {
      message: 'endTime must be after or equal to startTime',
      path: ['endTime'],
    }
  );

export const saveAiItinerarySchema = z.object({
  items: z.array(aiItineraryItemDraftSchema).min(1, { message: 'At least one itinerary item is required' }),
});

export type GenerateAiItineraryInput = z.infer<typeof generateAiItinerarySchema>;
export type AiItineraryItemDraft = z.infer<typeof aiItineraryItemDraftSchema>;
export type SaveAiItineraryInput = z.infer<typeof saveAiItinerarySchema>;
