import { prisma } from '../config/prisma.js';
import {
  VoteActivityInput,
  CreateCommentInput,
  GetCommentsQueryInput,
  SuggestActivityInput,
} from '../validators/collaboration.validator.js';

export class CollaborationService {
  /**
   * Helper to verify trip existence and user membership.
   * Any trip collaborator (OWNER, EDITOR, VIEWER) has access to vote, comment, and suggest.
   */
  private static async verifyTripMember(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        tripMembers: true,
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
      const error: any = new Error('Only trip collaborators can participate in this collaborative action');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Helper to calculate aggregate vote statistics for an activity in a trip.
   */
  private static async getActivityVoteStats(tripId: string, activityId: string) {
    const allVotes = await prisma.activityVote.findMany({
      where: { tripId, activityId },
    });

    const upvotes = allVotes.filter((v) => v.voteType === 'UPVOTE').length;
    const downvotes = allVotes.filter((v) => v.voteType === 'DOWNVOTE').length;

    return {
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      totalVotes: allVotes.length,
    };
  }

  /**
   * POST /api/trips/:tripId/activities/:activityId/vote
   * Cast or change a vote (UPVOTE / DOWNVOTE) on an activity.
   */
  static async voteActivity(
    tripId: string,
    activityId: string,
    userId: string,
    input: VoteActivityInput
  ) {
    await this.verifyTripMember(tripId, userId);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      const error: any = new Error('Activity not found');
      error.statusCode = 404;
      error.code = 'ACTIVITY_NOT_FOUND';
      throw error;
    }

    const vote = await prisma.activityVote.upsert({
      where: {
        tripId_activityId_userId: {
          tripId,
          activityId,
          userId,
        },
      },
      create: {
        tripId,
        activityId,
        userId,
        voteType: input.voteType as 'UPVOTE' | 'DOWNVOTE',
      },
      update: {
        voteType: input.voteType as 'UPVOTE' | 'DOWNVOTE',
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const stats = await this.getActivityVoteStats(tripId, activityId);

    return {
      vote,
      stats,
    };
  }

  /**
   * DELETE /api/trips/:tripId/activities/:activityId/vote
   * Remove own vote for an activity.
   */
  static async removeVote(tripId: string, activityId: string, userId: string) {
    await this.verifyTripMember(tripId, userId);

    const existingVote = await prisma.activityVote.findUnique({
      where: {
        tripId_activityId_userId: {
          tripId,
          activityId,
          userId,
        },
      },
    });

    if (!existingVote) {
      const error: any = new Error('No existing vote found to remove');
      error.statusCode = 404;
      error.code = 'VOTE_NOT_FOUND';
      throw error;
    }

    await prisma.activityVote.delete({
      where: {
        tripId_activityId_userId: {
          tripId,
          activityId,
          userId,
        },
      },
    });

    const stats = await this.getActivityVoteStats(tripId, activityId);

    return {
      tripId,
      activityId,
      removed: true,
      stats,
    };
  }

  /**
   * POST /api/trips/:tripId/comments
   * Add a collaborative comment on the trip or a specific itinerary item.
   */
  static async createComment(tripId: string, userId: string, input: CreateCommentInput) {
    await this.verifyTripMember(tripId, userId);

    // If itineraryItemId is provided, validate it exists and belongs to this trip
    if (input.itineraryItemId) {
      const item = await prisma.itineraryItem.findUnique({
        where: { id: input.itineraryItemId },
      });

      if (!item || item.tripId !== tripId) {
        const error: any = new Error('Itinerary item not found or does not belong to this trip');
        error.statusCode = 400;
        error.code = 'INVALID_ITINERARY_ITEM';
        throw error;
      }
    }

    const comment = await prisma.tripComment.create({
      data: {
        tripId,
        userId,
        itineraryItemId: input.itineraryItemId || null,
        text: input.text,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        itineraryItem: {
          select: { id: true, title: true, dayNumber: true, date: true },
        },
      },
    });

    return comment;
  }

  /**
   * GET /api/trips/:tripId/comments
   * List comments for a trip, newest first.
   */
  static async getComments(tripId: string, userId: string, query?: GetCommentsQueryInput) {
    await this.verifyTripMember(tripId, userId);

    const where: any = { tripId };

    if (query?.itineraryItemId) {
      where.itineraryItemId = query.itineraryItemId;
    }

    const comments = await prisma.tripComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        itineraryItem: {
          select: { id: true, title: true, dayNumber: true, date: true },
        },
      },
    });

    return {
      tripId,
      count: comments.length,
      comments,
    };
  }

  /**
   * POST /api/trips/:tripId/activities/:activityId/suggest
   * Suggest an activity to be considered for the trip itinerary.
   */
  static async suggestActivity(
    tripId: string,
    activityId: string,
    userId: string,
    input: SuggestActivityInput
  ) {
    await this.verifyTripMember(tripId, userId);

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { city: true },
    });

    if (!activity) {
      const error: any = new Error('Activity not found');
      error.statusCode = 404;
      error.code = 'ACTIVITY_NOT_FOUND';
      throw error;
    }

    const suggestion = await prisma.activitySuggestion.create({
      data: {
        tripId,
        activityId,
        userId,
        notes: input.notes || null,
        dayNumber: input.dayNumber || null,
        date: input.date ? new Date(input.date) : null,
        status: 'PENDING',
      },
      include: {
        activity: {
          include: {
            city: {
              select: { id: true, name: true, country: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return suggestion;
  }
}
