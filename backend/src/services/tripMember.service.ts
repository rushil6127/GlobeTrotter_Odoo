import { prisma } from '../config/prisma.js';
import { InviteMemberInput, UpdateMemberRoleInput } from '../validators/tripMember.validator.js';

export class TripMemberService {
  /**
   * Helper to verify trip existence and user view permissions (OWNER, EDITOR, VIEWER).
   */
  private static async verifyTripViewPermission(tripId: string, userId: string) {
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
      },
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
      const error: any = new Error('Unauthorized to view this trip members');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Helper to verify trip existence and OWNER authorization.
   * Only the trip OWNER can manage (invite, update, remove) collaborators.
   */
  private static async verifyTripOwnerPermission(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        tripMembers: true,
      },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    if (trip.userId !== userId) {
      const error: any = new Error('Only the trip owner can manage trip collaborators');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * GET /api/trips/:tripId/members
   * List all trip collaborators and roles.
   */
  static async getTripMembers(tripId: string, userId: string) {
    const trip = await this.verifyTripViewPermission(tripId, userId);

    const members = await prisma.tripMember.findMany({
      where: { tripId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      tripId: trip.id,
      tripName: trip.name,
      owner: trip.user,
      members,
    };
  }

  /**
   * POST /api/trips/:tripId/members
   * Invite a user to a trip by email (OWNER only).
   */
  static async addTripMember(tripId: string, userId: string, input: InviteMemberInput) {
    const trip = await this.verifyTripOwnerPermission(tripId, userId);

    // Validate that the invited user exists in the system
    const targetUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, avatar: true },
    });

    if (!targetUser) {
      const error: any = new Error(`User with email "${input.email}" not found`);
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Prevent owner from inviting themselves
    if (targetUser.id === trip.userId) {
      const error: any = new Error('Cannot add trip owner as a collaborator');
      error.statusCode = 400;
      error.code = 'INVALID_MEMBER_INVITE';
      throw error;
    }

    // Check for duplicate membership
    const existingMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      const error: any = new Error('User is already a collaborator on this trip');
      error.statusCode = 409;
      error.code = 'MEMBER_ALREADY_EXISTS';
      throw error;
    }

    const newMember = await prisma.tripMember.create({
      data: {
        tripId,
        userId: targetUser.id,
        role: input.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return newMember;
  }

  /**
   * PUT /api/trips/:tripId/members/:memberId
   * Update a collaborator's role (OWNER only).
   */
  static async updateTripMemberRole(
    tripId: string,
    memberId: string,
    userId: string,
    input: UpdateMemberRoleInput
  ) {
    await this.verifyTripOwnerPermission(tripId, userId);

    const member = await prisma.tripMember.findFirst({
      where: {
        tripId,
        OR: [{ id: memberId }, { userId: memberId }],
      },
    });

    if (!member) {
      const error: any = new Error('Trip member not found');
      error.statusCode = 404;
      error.code = 'MEMBER_NOT_FOUND';
      throw error;
    }

    const updatedMember = await prisma.tripMember.update({
      where: { id: member.id },
      data: { role: input.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return updatedMember;
  }

  /**
   * DELETE /api/trips/:tripId/members/:memberId
   * Remove a collaborator from a trip (OWNER only).
   */
  static async removeTripMember(tripId: string, memberId: string, userId: string) {
    await this.verifyTripOwnerPermission(tripId, userId);

    const member = await prisma.tripMember.findFirst({
      where: {
        tripId,
        OR: [{ id: memberId }, { userId: memberId }],
      },
    });

    if (!member) {
      const error: any = new Error('Trip member not found');
      error.statusCode = 404;
      error.code = 'MEMBER_NOT_FOUND';
      throw error;
    }

    await prisma.tripMember.delete({
      where: { id: member.id },
    });

    return {
      id: member.id,
      tripId,
      userId: member.userId,
    };
  }
}
