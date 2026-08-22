import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CreateTripInput, UpdateTripInput } from '../validators/trip.validator.js';

export class TripController {
  static async getTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const trips = await TripService.getUserTrips(req.user.id);
      sendSuccess(res, { trips }, 'Trips retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to retrieve trips', 'TRIP_FETCH_ERROR', 500);
    }
  }

  static async getTripById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const trip = await TripService.getTripById(tripId, req.user.id);
      sendSuccess(res, { trip }, 'Trip retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to retrieve trip', 'TRIP_FETCH_ERROR', 500);
    }
  }

  static async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const input: CreateTripInput = req.body;
      const trip = await TripService.createTrip(req.user.id, input);
      sendSuccess(res, { trip }, 'Trip created successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to create trip', 'TRIP_CREATE_ERROR', 500);
    }
  }

  static async updateTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: UpdateTripInput = req.body;
      const trip = await TripService.updateTrip(tripId, req.user.id, input);
      sendSuccess(res, { trip }, 'Trip updated successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to update trip', 'TRIP_UPDATE_ERROR', 500);
    }
  }

  static async deleteTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const result = await TripService.deleteTrip(tripId, req.user.id);
      sendSuccess(res, result, 'Trip deleted successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to delete trip', 'TRIP_DELETE_ERROR', 500);
    }
  }
}
