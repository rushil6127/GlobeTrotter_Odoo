import { Request, Response, NextFunction } from 'express';
import { ShareService } from '../services/share.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CreateShareLinkInput } from '../validators/share.validator.js';

export class ShareController {
  /**
   * POST /api/trips/:tripId/share
   * Generate or retrieve an active share link for a trip.
   */
  static async createShareLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: CreateShareLinkInput = req.body;
      const shareLink = await ShareService.createShareLink(tripId, req.user.id, input);
      sendSuccess(res, { shareLink }, 'Trip share link created successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to create share link', 'SHARE_CREATE_ERROR', 500);
    }
  }

  /**
   * DELETE /api/trips/:tripId/share
   * Revoke sharing for a trip.
   */
  static async revokeShareLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const result = await ShareService.revokeShareLink(tripId, req.user.id);
      sendSuccess(res, result, 'Trip share link revoked successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to revoke share link', 'SHARE_REVOKE_ERROR', 500);
    }
  }

  /**
   * GET /api/trips/:tripId/share
   * Check active share status for a trip (authenticated owner/editor).
   */
  static async getTripShareStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const result = await ShareService.getTripShareStatus(tripId, req.user.id);
      sendSuccess(res, result, 'Trip share status retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve share status', 'SHARE_STATUS_ERROR', 500);
    }
  }

  /**
   * GET /api/shared/:shareId
   * Public retrieval of shared trip by shareKey.
   */
  static async getPublicSharedTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shareId } = req.params;
      const publicTrip = await ShareService.getPublicSharedTrip(shareId);
      sendSuccess(res, publicTrip, 'Public trip details retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve shared trip', 'SHARED_TRIP_FETCH_ERROR', 500);
    }
  }
}
