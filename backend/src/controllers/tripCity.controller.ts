import { Request, Response, NextFunction } from 'express';
import { TripCityService } from '../services/tripCity.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AddCityToTripInput, ReorderTripCitiesInput } from '../validators/tripCity.validator.js';

export class TripCityController {
  /**
   * GET /api/trips/:tripId/cities
   * Retrieve all cities configured for a trip in order.
   */
  static async getTripCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const tripCities = await TripCityService.getTripCities(tripId, req.user.id);
      sendSuccess(res, { tripCities }, 'Trip cities retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve trip cities', 'TRIP_CITY_FETCH_ERROR', 500);
    }
  }

  /**
   * POST /api/trips/:tripId/cities
   * Add a destination city to a trip.
   */
  static async addCityToTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: AddCityToTripInput = req.body;
      const tripCity = await TripCityService.addCityToTrip(tripId, req.user.id, input);
      sendSuccess(res, { tripCity }, 'City added to trip successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to add city to trip', 'TRIP_CITY_ADD_ERROR', 500);
    }
  }

  /**
   * DELETE /api/trips/:tripId/cities/:cityId
   * Remove a destination city from a trip.
   */
  static async removeCityFromTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId, cityId } = req.params;
      const result = await TripCityService.removeCityFromTrip(tripId, cityId, req.user.id);
      sendSuccess(res, result, 'City removed from trip successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to remove city from trip', 'TRIP_CITY_REMOVE_ERROR', 500);
    }
  }

  /**
   * PUT /api/trips/:tripId/cities/reorder
   * Reorder stops in a multi-city trip.
   */
  static async reorderTripCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: ReorderTripCitiesInput = req.body;
      const tripCities = await TripCityService.reorderTripCities(tripId, req.user.id, input);
      sendSuccess(res, { tripCities }, 'Trip cities reordered successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to reorder trip cities', 'TRIP_CITY_REORDER_ERROR', 500);
    }
  }
}
