import { prisma } from '../config/prisma.js';
import { AddCityToTripInput, ReorderTripCitiesInput } from '../validators/tripCity.validator.js';

export class TripCityService {
  /**
   * Helper method to verify that a trip exists and the requesting user has edit permission (OWNER or EDITOR).
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
   * Helper method to verify that a trip exists and the user can view it (OWNER, EDITOR, or VIEWER).
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
   * Retrieve all cities added to a trip, ordered by route sequence.
   */
  static async getTripCities(tripId: string, userId: string) {
    await this.verifyTripViewPermission(tripId, userId);

    return prisma.tripCity.findMany({
      where: { tripId },
      orderBy: { order: 'asc' },
      include: {
        city: true,
      },
    });
  }

  /**
   * Add a destination city to a trip.
   */
  static async addCityToTrip(tripId: string, userId: string, input: AddCityToTripInput) {
    await this.verifyTripEditPermission(tripId, userId);

    // 1. Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: input.cityId },
    });

    if (!city) {
      const error: any = new Error(`City with ID '${input.cityId}' not found`);
      error.statusCode = 404;
      error.code = 'CITY_NOT_FOUND';
      throw error;
    }

    // 2. Check for duplicate city in trip
    const existingTripCity = await prisma.tripCity.findUnique({
      where: {
        tripId_cityId: {
          tripId,
          cityId: input.cityId,
        },
      },
    });

    if (existingTripCity) {
      const error: any = new Error(`City '${city.name}' is already added to this trip`);
      error.statusCode = 409;
      error.code = 'CITY_ALREADY_IN_TRIP';
      throw error;
    }

    // 3. Compute order sequence if not explicitly provided
    let assignedOrder = input.order;
    if (assignedOrder === undefined) {
      const lastStop = await prisma.tripCity.findFirst({
        where: { tripId },
        orderBy: { order: 'desc' },
      });
      assignedOrder = (lastStop?.order ?? -1) + 1;
    }

    const arrivalDate = input.arrivalDate ? new Date(input.arrivalDate) : null;
    const departureDate = input.departureDate ? new Date(input.departureDate) : null;

    const newTripCity = await prisma.tripCity.create({
      data: {
        tripId,
        cityId: input.cityId,
        order: assignedOrder,
        arrivalDate,
        departureDate,
      },
      include: {
        city: true,
      },
    });

    return newTripCity;
  }

  /**
   * Remove a destination city from a trip.
   */
  static async removeCityFromTrip(tripId: string, cityId: string, userId: string) {
    await this.verifyTripEditPermission(tripId, userId);

    const existingTripCity = await prisma.tripCity.findUnique({
      where: {
        tripId_cityId: {
          tripId,
          cityId,
        },
      },
      include: {
        city: true,
      },
    });

    if (!existingTripCity) {
      const error: any = new Error('City is not part of this trip');
      error.statusCode = 404;
      error.code = 'TRIP_CITY_NOT_FOUND';
      throw error;
    }

    await prisma.tripCity.delete({
      where: {
        tripId_cityId: {
          tripId,
          cityId,
        },
      },
    });

    return {
      tripId,
      cityId,
      cityName: existingTripCity.city.name,
    };
  }

  /**
   * Reorder destination cities within a trip.
   */
  static async reorderTripCities(tripId: string, userId: string, input: ReorderTripCitiesInput) {
    await this.verifyTripEditPermission(tripId, userId);

    const currentTripCities = await prisma.tripCity.findMany({
      where: { tripId },
    });

    const currentCityIds = new Set(currentTripCities.map((tc) => tc.cityId));

    let updates: { cityId: string; order: number }[] = [];

    if (input.cityOrders && input.cityOrders.length > 0) {
      for (const item of input.cityOrders) {
        if (!currentCityIds.has(item.cityId)) {
          const error: any = new Error(`City with ID '${item.cityId}' is not part of this trip`);
          error.statusCode = 400;
          error.code = 'INVALID_CITY_IN_REORDER';
          throw error;
        }
      }
      updates = input.cityOrders;
    } else if (input.cityIds && input.cityIds.length > 0) {
      for (const cityId of input.cityIds) {
        if (!currentCityIds.has(cityId)) {
          const error: any = new Error(`City with ID '${cityId}' is not part of this trip`);
          error.statusCode = 400;
          error.code = 'INVALID_CITY_IN_REORDER';
          throw error;
        }
      }
      updates = input.cityIds.map((cityId, index) => ({
        cityId,
        order: index,
      }));
    }

    // Execute bulk update within a transaction
    await prisma.$transaction(
      updates.map(({ cityId, order }) =>
        prisma.tripCity.update({
          where: {
            tripId_cityId: {
              tripId,
              cityId,
            },
          },
          data: { order },
        })
      )
    );

    // Return the updated ordered list
    const updatedTripCities = await prisma.tripCity.findMany({
      where: { tripId },
      orderBy: { order: 'asc' },
      include: {
        city: true,
      },
    });

    return updatedTripCities;
  }
}
