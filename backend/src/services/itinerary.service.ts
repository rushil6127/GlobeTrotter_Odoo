import { prisma } from '../config/prisma.js';
import {
  CreateItineraryItemInput,
  UpdateItineraryItemInput,
  ReorderItineraryInput,
  GetTripItineraryQueryInput,
} from '../validators/itinerary.validator.js';

export class ItineraryService {
  /**
   * Verify trip exists and user has view permission (OWNER, EDITOR, VIEWER).
   */
  private static async verifyTripViewPermission(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tripMembers: true },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    const isOwner = trip.userId === userId;
    const isMember = trip.tripMembers.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      const error: any = new Error('Unauthorized to view this trip');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Verify trip exists and user has edit permission (OWNER or EDITOR).
   */
  private static async verifyTripEditPermission(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tripMembers: true },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    const isOwner = trip.userId === userId;
    const isEditor = trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to modify this trip');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Validates that a given date falls strictly within the trip's [startDate, endDate] window.
   * Returns the 1-indexed day number relative to the trip start date.
   */
  public static validateDateWithinTrip(
    date: Date | string,
    trip: { startDate: Date; endDate: Date }
  ): number {
    const tripStart = new Date(trip.startDate);
    tripStart.setUTCHours(0, 0, 0, 0);

    const tripEnd = new Date(trip.endDate);
    tripEnd.setUTCHours(23, 59, 59, 999);

    const itemDate = new Date(date);
    itemDate.setUTCHours(0, 0, 0, 0);

    if (isNaN(itemDate.getTime())) {
      const error: any = new Error('Invalid date format provided');
      error.statusCode = 400;
      error.code = 'INVALID_DATE';
      throw error;
    }

    if (itemDate < tripStart || itemDate > tripEnd) {
      const startStr = tripStart.toISOString().split('T')[0];
      const endStr = tripEnd.toISOString().split('T')[0];
      const error: any = new Error(
        `Itinerary date must fall within the trip date range: ${startStr} to ${endStr}`
      );
      error.statusCode = 400;
      error.code = 'INVALID_ITINERARY_DATE';
      throw error;
    }

    const diffTime = itemDate.getTime() - tripStart.getTime();
    const calculatedDayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, calculatedDayNumber);
  }

  /**
   * Validate that an activityId references an existing Activity.
   */
  private static async validateActivityExists(activityId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        city: true,
      },
    });

    if (!activity) {
      const error: any = new Error(`Activity with ID '${activityId}' not found`);
      error.statusCode = 404;
      error.code = 'ACTIVITY_NOT_FOUND';
      throw error;
    }

    return activity;
  }

  /**
   * Retrieve day-wise itinerary for a trip.
   */
  static async getTripItinerary(
    tripId: string,
    userId: string,
    query?: GetTripItineraryQueryInput
  ) {
    await this.verifyTripViewPermission(tripId, userId);

    const where: any = { tripId };

    if (query?.dayNumber !== undefined) {
      where.dayNumber = query.dayNumber;
    }

    if (query?.date) {
      const targetDate = new Date(query.date);
      targetDate.setUTCHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      where.date = {
        gte: targetDate,
        lt: nextDate,
      };
    }

    const items = await prisma.itineraryItem.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { dayNumber: 'asc' },
        { order: 'asc' },
        { startTime: 'asc' },
      ],
      include: {
        activity: {
          include: {
            city: {
              select: { id: true, name: true, country: true, image: true },
            },
          },
        },
      },
    });

    // Group items by dayNumber for convenient frontend consumption
    const daysMap = new Map<number, typeof items>();
    for (const item of items) {
      const day = item.dayNumber;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push(item);
    }

    const days = Array.from(daysMap.entries()).map(([dayNumber, dayItems]) => ({
      dayNumber,
      date: dayItems[0]?.date ? dayItems[0].date.toISOString().split('T')[0] : null,
      itemsCount: dayItems.length,
      items: dayItems,
    }));

    return {
      items,
      days,
      totalItems: items.length,
    };
  }

  /**
   * Create an itinerary item under a trip.
   */
  static async createItineraryItem(
    tripId: string,
    userId: string,
    input: CreateItineraryItemInput
  ) {
    const trip = await this.verifyTripEditPermission(tripId, userId);

    // 1. Validate date within trip boundaries and calculate dayNumber
    const calculatedDayNumber = this.validateDateWithinTrip(input.date, trip);
    const dayNumber = input.dayNumber !== undefined ? input.dayNumber : calculatedDayNumber;

    // 2. Validate activity reference if supplied
    let activity = null;
    if (input.activityId) {
      activity = await this.validateActivityExists(input.activityId);
    }

    // 3. Compute sequence order if omitted
    let assignedOrder = input.order;
    if (assignedOrder === undefined) {
      const lastItem = await prisma.itineraryItem.findFirst({
        where: { tripId, dayNumber },
        orderBy: { order: 'desc' },
      });
      assignedOrder = (lastItem?.order ?? -1) + 1;
    }

    const estimatedCost =
      input.estimatedCost !== undefined
        ? input.estimatedCost
        : (activity?.estimatedCost ?? 0);

    const item = await prisma.itineraryItem.create({
      data: {
        tripId,
        title: input.title,
        date: new Date(input.date),
        dayNumber,
        activityId: input.activityId || null,
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        notes: input.notes || null,
        estimatedCost,
        order: assignedOrder,
      },
      include: {
        activity: {
          include: {
            city: {
              select: { id: true, name: true, country: true, image: true },
            },
          },
        },
      },
    });

    return item;
  }

  /**
   * Retrieve single itinerary item by ID.
   */
  static async getItineraryItemById(itemId: string, userId: string) {
    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      include: {
        trip: {
          include: { tripMembers: true },
        },
        activity: {
          include: {
            city: true,
          },
        },
      },
    });

    if (!item) {
      const error: any = new Error('Itinerary item not found');
      error.statusCode = 404;
      error.code = 'ITINERARY_ITEM_NOT_FOUND';
      throw error;
    }

    const isOwner = item.trip.userId === userId;
    const isMember = item.trip.tripMembers.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      const error: any = new Error('Unauthorized to view this itinerary item');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const { trip, ...rest } = item;
    return rest;
  }

  /**
   * Update an existing itinerary item.
   */
  static async updateItineraryItem(
    itemId: string,
    userId: string,
    input: UpdateItineraryItemInput
  ) {
    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      include: {
        trip: {
          include: { tripMembers: true },
        },
      },
    });

    if (!item) {
      const error: any = new Error('Itinerary item not found');
      error.statusCode = 404;
      error.code = 'ITINERARY_ITEM_NOT_FOUND';
      throw error;
    }

    const isOwner = item.trip.userId === userId;
    const isEditor = item.trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to modify this itinerary item');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Validate new date if provided
    let dayNumber = input.dayNumber;
    if (input.date) {
      const calculatedDayNumber = this.validateDateWithinTrip(input.date, item.trip);
      if (dayNumber === undefined && !input.dayNumber) {
        dayNumber = calculatedDayNumber;
      }
    }

    // Validate activity if provided
    if (input.activityId) {
      await this.validateActivityExists(input.activityId);
    }

    // Validate time consistency if one or both times updated
    const startTime = input.startTime !== undefined ? input.startTime : item.startTime;
    const endTime = input.endTime !== undefined ? input.endTime : item.endTime;
    if (startTime && endTime && startTime > endTime) {
      const error: any = new Error('endTime must be after or equal to startTime');
      error.statusCode = 400;
      error.code = 'INVALID_TIME_RANGE';
      throw error;
    }

    const updatedItem = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(dayNumber !== undefined ? { dayNumber } : {}),
        ...(input.activityId !== undefined ? { activityId: input.activityId } : {}),
        ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
        ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.estimatedCost !== undefined ? { estimatedCost: input.estimatedCost } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
      },
      include: {
        activity: {
          include: {
            city: {
              select: { id: true, name: true, country: true, image: true },
            },
          },
        },
      },
    });

    return updatedItem;
  }

  /**
   * Delete an itinerary item.
   */
  static async deleteItineraryItem(itemId: string, userId: string) {
    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      include: {
        trip: {
          include: { tripMembers: true },
        },
      },
    });

    if (!item) {
      const error: any = new Error('Itinerary item not found');
      error.statusCode = 404;
      error.code = 'ITINERARY_ITEM_NOT_FOUND';
      throw error;
    }

    const isOwner = item.trip.userId === userId;
    const isEditor = item.trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to delete this itinerary item');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await prisma.itineraryItem.delete({
      where: { id: itemId },
    });

    return {
      id: itemId,
      tripId: item.tripId,
      title: item.title,
    };
  }

  /**
   * Reorder itinerary items within a trip.
   */
  static async reorderItineraryItems(
    tripId: string,
    userId: string,
    input: ReorderItineraryInput
  ) {
    await this.verifyTripEditPermission(tripId, userId);

    const currentItems = await prisma.itineraryItem.findMany({
      where: { tripId },
    });

    const currentItemIds = new Set(currentItems.map((i) => i.id));

    let updates: { itemId: string; order: number; dayNumber?: number; date?: Date }[] = [];

    if (input.itemOrders && input.itemOrders.length > 0) {
      for (const item of input.itemOrders) {
        if (!currentItemIds.has(item.itemId)) {
          const error: any = new Error(`Item with ID '${item.itemId}' is not part of this trip`);
          error.statusCode = 400;
          error.code = 'INVALID_ITEM_IN_REORDER';
          throw error;
        }
      }
      updates = input.itemOrders.map((i) => ({
        itemId: i.itemId,
        order: i.order,
        dayNumber: i.dayNumber,
        date: i.date ? new Date(i.date) : undefined,
      }));
    } else if (input.itemIds && input.itemIds.length > 0) {
      for (const itemId of input.itemIds) {
        if (!currentItemIds.has(itemId)) {
          const error: any = new Error(`Item with ID '${itemId}' is not part of this trip`);
          error.statusCode = 400;
          error.code = 'INVALID_ITEM_IN_REORDER';
          throw error;
        }
      }
      updates = input.itemIds.map((itemId, index) => ({
        itemId,
        order: index,
      }));
    }

    // Execute bulk update in a transaction
    await prisma.$transaction(
      updates.map(({ itemId, order, dayNumber, date }) =>
        prisma.itineraryItem.update({
          where: { id: itemId },
          data: {
            order,
            ...(dayNumber !== undefined ? { dayNumber } : {}),
            ...(date !== undefined ? { date } : {}),
          },
        })
      )
    );

    const updatedItems = await prisma.itineraryItem.findMany({
      where: { tripId },
      orderBy: [
        { date: 'asc' },
        { dayNumber: 'asc' },
        { order: 'asc' },
        { startTime: 'asc' },
      ],
      include: {
        activity: {
          include: {
            city: {
              select: { id: true, name: true, country: true, image: true },
            },
          },
        },
      },
    });

    return updatedItems;
  }
}
