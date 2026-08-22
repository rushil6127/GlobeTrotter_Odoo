import { z } from 'zod';

export const addCityToTripSchema = z
  .object({
    cityId: z.string().trim().min(1, { message: 'cityId is required' }),
    order: z.number().int().min(0).optional(),
    arrivalDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD or ISO string'))
      .optional()
      .nullable(),
    departureDate: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD or ISO string'))
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.arrivalDate && data.departureDate) {
        const arrival = new Date(data.arrivalDate);
        const departure = new Date(data.departureDate);
        return !isNaN(arrival.getTime()) && !isNaN(departure.getTime()) && arrival <= departure;
      }
      return true;
    },
    {
      message: 'departureDate must be on or after arrivalDate',
      path: ['departureDate'],
    }
  );

export const reorderTripCitiesSchema = z
  .object({
    cityOrders: z
      .array(
        z.object({
          cityId: z.string().trim().min(1, { message: 'cityId cannot be empty' }),
          order: z.number().int().min(0, { message: 'order must be a non-negative integer' }),
        })
      )
      .optional(),
    cityIds: z.array(z.string().trim().min(1, { message: 'cityId cannot be empty' })).optional(),
  })
  .refine((data) => Boolean(data.cityOrders?.length || data.cityIds?.length), {
    message: 'Either cityOrders or cityIds array is required for reordering',
  })
  .refine(
    (data) => {
      if (data.cityOrders) {
        const ids = data.cityOrders.map((item) => item.cityId);
        return new Set(ids).size === ids.length;
      }
      if (data.cityIds) {
        return new Set(data.cityIds).size === data.cityIds.length;
      }
      return true;
    },
    {
      message: 'Duplicate city IDs are not allowed in reordering payload',
    }
  );

export const tripIdParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'tripId is required' }),
});

export const tripCityParamSchema = z.object({
  tripId: z.string().trim().min(1, { message: 'tripId is required' }),
  cityId: z.string().trim().min(1, { message: 'cityId is required' }),
});

export type AddCityToTripInput = z.infer<typeof addCityToTripSchema>;
export type ReorderTripCitiesInput = z.infer<typeof reorderTripCitiesSchema>;
export type TripIdParamInput = z.infer<typeof tripIdParamSchema>;
export type TripCityParamInput = z.infer<typeof tripCityParamSchema>;
