import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { GetActivitiesQueryInput } from '../validators/activity.validator.js';

export class ActivityController {
  /**
   * GET /api/activities
   * Retrieve paginated activities with filters: cityId, category, maxCost, duration, search, etc.
   */
  static async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as GetActivitiesQueryInput;
      const result = await ActivityService.getActivities(query);
      sendSuccess(res, result, 'Activities retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve activities', 'ACTIVITIES_FETCH_ERROR', 500);
    }
  }

  /**
   * GET /api/activities/:activityId
   * Retrieve single activity details by ID.
   */
  static async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { activityId } = req.params;
      const activity = await ActivityService.getActivityById(activityId);
      sendSuccess(res, { activity }, 'Activity retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve activity', 'ACTIVITY_FETCH_ERROR', 500);
    }
  }
}
