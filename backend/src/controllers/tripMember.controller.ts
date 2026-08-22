import { Request, Response, NextFunction } from 'express';
import { TripMemberService } from '../services/tripMember.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { InviteMemberInput, UpdateMemberRoleInput } from '../validators/tripMember.validator.js';

export class TripMemberController {
  /**
   * GET /api/trips/:tripId/members
   * List all trip collaborators and roles.
   */
  static async getTripMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const result = await TripMemberService.getTripMembers(tripId, req.user.id);
      sendSuccess(res, result, 'Trip members retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve trip members', 'MEMBER_FETCH_ERROR', 500);
    }
  }

  /**
   * POST /api/trips/:tripId/members
   * Invite a user to a trip by email (OWNER only).
   */
  static async addTripMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: InviteMemberInput = req.body;
      const member = await TripMemberService.addTripMember(tripId, req.user.id, input);
      sendSuccess(res, { member }, 'Trip collaborator invited successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to invite trip member', 'MEMBER_INVITE_ERROR', 500);
    }
  }

  /**
   * PUT /api/trips/:tripId/members/:memberId
   * Update a collaborator's role (OWNER only).
   */
  static async updateTripMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId, memberId } = req.params;
      const input: UpdateMemberRoleInput = req.body;
      const member = await TripMemberService.updateTripMemberRole(tripId, memberId, req.user.id, input);
      sendSuccess(res, { member }, 'Trip member role updated successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to update member role', 'MEMBER_UPDATE_ERROR', 500);
    }
  }

  /**
   * DELETE /api/trips/:tripId/members/:memberId
   * Remove a collaborator from a trip (OWNER only).
   */
  static async removeTripMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId, memberId } = req.params;
      const result = await TripMemberService.removeTripMember(tripId, memberId, req.user.id);
      sendSuccess(res, result, 'Trip member removed successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to remove member', 'MEMBER_REMOVE_ERROR', 500);
    }
  }
}
