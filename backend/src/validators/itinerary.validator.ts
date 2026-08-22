import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createItineraryItemSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Title is required' }).max(200),
    date: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string')),
    dayNumber: z.number().int().positive({ message: 'dayNumber must be a positive integer' }).optional(),
    activityId: z.string().trim().optional().nullable(),
    startTime: z.string().regex(timeRegex, 'startTime must be in HH:mm format (24h)').optional().nullable(),
    endTime: z.string().regex(timeRegex, 'endTime must be in HH:mm format (24h)').optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    estimatedCost: z.number().nonnegative({ message: 'estimatedCost must be non-negative' }).optional(),
    order: z.number().int().min(0, { message: 'order must be a non-negative integer' }).optional(),
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

export const updateItineraryItemSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Title cannot be empty' }).max(200).optional(),
    date: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
      .optional(),
    dayNumber: z.number().int().positive({ message: 'dayNumber must be a positive integer' }).optional(),
    activityId: z.string().trim().optional().nullable(),
    startTime: z.string().regex(timeRegex, 'startTime must be in HH:mm format (24h)').optional().nullable(),
    endTime: z.string().regex(timeRegex, 'endTime must be in HH:mm format (24h)').optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    estimatedCost: z.number().nonnegative({ message: 'estimatedCost must be non-negative' }).optional(),
    order: z.number().int().min(0, { message: 'order must be a non-negative integer' }).optional(),
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

export const reorderItinerarySchema = z
  .object({
    itemOrders: z
      .array(
        z.object({
          itemId: z.string().trim().min(1, { message: 'itemId cannot be empty' }),
          order: z.number().int().min(0, { message: 'order must be a non-negative integer' }),
          dayNumber: z.number().int().positive().optional(),
          date: z
            .string()
            .datetime({ offset: true })
            .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
            .optional(),
        })
      )
      .optional(),
    itemIds: z.array(z.string().trim().min(1, { message: 'itemId cannot be empty' })).optional(),
  })
  .refine((data) => Boolean(data.itemOrders?.length || data.itemIds?.length), {
    message: 'Either itemOrders or itemIds array is required for reordering',
  })
  .refine(
    (data) => {
      if (data.itemOrders) {
        const ids = data.itemOrders.map((item) => item.itemId);
        return new Set(ids).size === ids.length;
      }
      if (data.itemIds) {
        return new Set(data.itemIds).size === data.itemIds.length;
      }
      return true;
    },
    {
      message: 'Duplicate item IDs are not allowed in reordering payload',
    }
  );

export const getTripItineraryQuerySchema = z.object({
  dayNumber: z.coerce.number().int().positive().optional(),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO string'))
    .optional(),
});

export const itineraryItemIdParamSchema = z.object({
  itemId: z.string().trim().min(1, { message: 'itemId is required' }),
});

export type CreateItineraryItemInput = z.infer<typeof createItineraryItemSchema>;
export type UpdateItineraryItemInput = z.infer<typeof updateItineraryItemSchema>;
export type ReorderItineraryInput = z.infer<typeof reorderItinerarySchema>;
export type GetTripItineraryQueryInput = z.infer<typeof getTripItineraryQuerySchema>;
export type ItineraryItemIdParamInput = z.infer<typeof itineraryItemIdParamSchema>;
