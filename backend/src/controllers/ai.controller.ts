import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { GenerateAiItineraryInput, SaveAiItineraryInput } from '../validators/ai.validator.js';

export class AIController {
  /**
   * POST /api/ai/generate-itinerary
   * Generate an AI-powered travel plan and day-wise itinerary draft.
   */
  static async generateItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: GenerateAiItineraryInput = req.body;
      const result = await AIService.generateItinerary(input);
      sendSuccess(res, result, 'AI itinerary generated successfully', 200);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        sendError(res, 'AI generation service timed out. Please try again.', 'AI_TIMEOUT', 504);
        return;
      }
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to generate itinerary with AI', 'AI_GENERATION_ERROR', 502);
    }
  }

  /**
   * POST /api/trips/:tripId/itinerary/from-ai
   * Persist a generated AI itinerary draft to a trip.
   */
  static async saveAiItineraryToTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }

      const { tripId } = req.params;
      const input: SaveAiItineraryInput = req.body;
      const result = await AIService.saveAiDraftToTrip(tripId, req.user.id, input);
      sendSuccess(res, result, 'AI itinerary draft saved to trip successfully', 201);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to save AI itinerary to trip', 'AI_SAVE_ERROR', 500);
    }
  }
}
