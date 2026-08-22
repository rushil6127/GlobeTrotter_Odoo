import { prisma } from '../config/prisma.js';
import { CreateTripInput, UpdateTripInput } from '../validators/trip.validator.js';

export class TripService {
  static async getUserTrips(userId: string) {
    return prisma.trip.findMany({
      where: {
        OR: [
          { userId },
          { tripMembers: { some: { userId } } },
        ],
      },
      orderBy: { startDate: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: {
            tripCities: true,
            itineraryItems: true,
            expenses: true,
          },
        },
      },
    });
  }

  static async getTripById(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        tripMembers: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        _count: {
          select: {
            tripCities: true,
            itineraryItems: true,
            expenses: true,
          },
        },
      },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    // Check authorization: must be owner or member
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

  static async createTrip(userId: string, input: CreateTripInput) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    return prisma.trip.create({
      data: {
        name: input.name,
        description: input.description,
        startDate,
        endDate,
        budget: input.budget ?? 0,
        currency: input.currency ?? 'INR',
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: {
            tripCities: true,
            itineraryItems: true,
            expenses: true,
          },
        },
      },
    });
  }

  static async updateTrip(tripId: string, userId: string, input: UpdateTripInput) {
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tripMembers: true },
    });

    if (!existingTrip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    // Check authorization: must be owner or editor
    const isOwner = existingTrip.userId === userId;
    const isEditor = existingTrip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to modify this trip');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const startDate = input.startDate ? new Date(input.startDate) : existingTrip.startDate;
    const endDate = input.endDate ? new Date(input.endDate) : existingTrip.endDate;

    if (startDate > endDate) {
      const error: any = new Error('endDate must be on or after startDate');
      error.statusCode = 400;
      error.code = 'INVALID_DATE_RANGE';
      throw error;
    }

    const updateData: {
      name?: string;
      description?: string | null;
      startDate?: Date;
      endDate?: Date;
      budget?: number;
      currency?: string;
    } = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.startDate !== undefined) updateData.startDate = startDate;
    if (input.endDate !== undefined) updateData.endDate = endDate;
    if (input.budget !== undefined) updateData.budget = input.budget;
    if (input.currency !== undefined) updateData.currency = input.currency;

    return prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: {
            tripCities: true,
            itineraryItems: true,
            expenses: true,
          },
        },
      },
    });
  }

  static async deleteTrip(tripId: string, userId: string) {
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!existingTrip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    // Only owner can delete the trip
    if (existingTrip.userId !== userId) {
      const error: any = new Error('Only the trip owner can delete this trip');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return { id: tripId };
  }
}
