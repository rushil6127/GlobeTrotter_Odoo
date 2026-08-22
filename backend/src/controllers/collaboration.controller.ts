import { Request, Response, NextFunction } from 'express';
import { CollaborationService } from '../services/collaboration.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  VoteActivityInput,
  CreateCommentInput,
  GetCommentsQueryInput,
  SuggestActivityInput,
} from '../validators/collaboration.validator.js';

export class CollaborationController {
  /**
   * POST /api/trips/:tripId/activities/:activityId/vote
   * Vote on an activity in a trip.
   */
  static async voteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId, activityId } = req.params;
      const input: VoteActivityInput = req.body;
      const result = await CollaborationService.voteActivity(tripId, activityId, req.user.id, input);
      sendSuccess(res, result, 'Vote recorded successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to record vote', 'VOTE_ERROR', 500);
    }
  }

  /**
   * DELETE /api/trips/:tripId/activities/:activityId/vote
   * Remove own vote for an activity.
   */
  static async removeVote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId, activityId } = req.params;
      const result = await CollaborationService.removeVote(tripId, activityId, req.user.id);
      sendSuccess(res, result, 'Vote removed successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to remove vote', 'VOTE_REMOVE_ERROR', 500);
    }
  }

  /**
   * POST /api/trips/:tripId/comments
   * Add a comment to the trip or itinerary item.
   */
  static async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: CreateCommentInput = req.body;
      const comment = await CollaborationService.createComment(tripId, req.user.id, input);
      sendSuccess(res, { comment }, 'Comment added successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to add comment', 'COMMENT_CREATE_ERROR', 500);
    }
  }

  /**
   * GET /api/trips/:tripId/comments
   * Retrieve comments for a trip.
   */
  static async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const query = req.query as unknown as GetCommentsQueryInput;
      const result = await CollaborationService.getComments(tripId, req.user.id, query);
      sendSuccess(res, result, 'Comments retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve comments', 'COMMENT_FETCH_ERROR', 500);
    }
  }

  /**
   * POST /api/trips/:tripId/activities/:activityId/suggest
   * Suggest an activity for the trip itinerary.
   */
  static async suggestActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId, activityId } = req.params;
      const input: SuggestActivityInput = req.body;
      const suggestion = await CollaborationService.suggestActivity(
        tripId,
        activityId,
        req.user.id,
        input
      );
      sendSuccess(res, { suggestion }, 'Activity suggested successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to suggest activity', 'SUGGESTION_CREATE_ERROR', 500);
    }
  }
}
