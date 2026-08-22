import { Request, Response, NextFunction } from 'express';
import { ItineraryService } from '../services/itinerary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  CreateItineraryItemInput,
  UpdateItineraryItemInput,
  ReorderItineraryInput,
  GetTripItineraryQueryInput,
} from '../validators/itinerary.validator.js';

export class ItineraryController {
  /**
   * GET /api/trips/:tripId/itinerary
   * Retrieve day-wise itinerary timeline for a trip.
   */
  static async getTripItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const query = req.query as unknown as GetTripItineraryQueryInput;
      const result = await ItineraryService.getTripItinerary(tripId, req.user.id, query);
      sendSuccess(res, result, 'Trip itinerary retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve trip itinerary', 'ITINERARY_FETCH_ERROR', 500);
    }
  }

  /**
   * POST /api/trips/:tripId/itinerary
   * Schedule a new itinerary item in a trip.
   */
  static async createItineraryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: CreateItineraryItemInput = req.body;
      const item = await ItineraryService.createItineraryItem(tripId, req.user.id, input);
      sendSuccess(res, { item }, 'Itinerary item created successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to create itinerary item', 'ITINERARY_CREATE_ERROR', 500);
    }
  }

  /**
   * GET /api/itinerary/:itemId
   * Retrieve a specific itinerary item.
   */
  static async getItineraryItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { itemId } = req.params;
      const item = await ItineraryService.getItineraryItemById(itemId, req.user.id);
      sendSuccess(res, { item }, 'Itinerary item retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve itinerary item', 'ITINERARY_FETCH_ERROR', 500);
    }
  }

  /**
   * PUT /api/itinerary/:itemId
   * Update an itinerary item.
   */
  static async updateItineraryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { itemId } = req.params;
      const input: UpdateItineraryItemInput = req.body;
      const item = await ItineraryService.updateItineraryItem(itemId, req.user.id, input);
      sendSuccess(res, { item }, 'Itinerary item updated successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to update itinerary item', 'ITINERARY_UPDATE_ERROR', 500);
    }
  }

  /**
   * DELETE /api/itinerary/:itemId
   * Remove an itinerary item.
   */
  static async deleteItineraryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { itemId } = req.params;
      const result = await ItineraryService.deleteItineraryItem(itemId, req.user.id);
      sendSuccess(res, result, 'Itinerary item deleted successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to delete itinerary item', 'ITINERARY_DELETE_ERROR', 500);
    }
  }

  /**
   * PUT /api/trips/:tripId/itinerary/reorder
   * Reorder items within trip days.
   */
  static async reorderItineraryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: ReorderItineraryInput = req.body;
      const items = await ItineraryService.reorderItineraryItems(tripId, req.user.id, input);
      sendSuccess(res, { items }, 'Itinerary items reordered successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to reorder itinerary items', 'ITINERARY_REORDER_ERROR', 500);
    }
  }
}
