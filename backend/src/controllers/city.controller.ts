import { Request, Response, NextFunction } from 'express';
import { CityService } from '../services/city.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { GetCitiesQueryInput, SearchCitiesQueryInput } from '../validators/city.validator.js';

export class CityController {
  /**
   * GET /api/cities
   * Retrieve paginated cities with optional search, country filter, and sorting.
   */
  static async getCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as GetCitiesQueryInput;
      const result = await CityService.getCities(query);
      sendSuccess(res, result, 'Cities retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve cities', 'CITIES_FETCH_ERROR', 500);
    }
  }

  /**
   * GET /api/cities/search?q=
   * Search cities by keyword across name, country, and description.
   */
  static async searchCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as SearchCitiesQueryInput;
      const cities = await CityService.searchCities(query);
      sendSuccess(
        res,
        {
          query: query.q,
          count: cities.length,
          cities,
        },
        'City search results retrieved successfully',
        200
      );
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to search cities', 'CITY_SEARCH_ERROR', 500);
    }
  }

  /**
   * GET /api/cities/:cityId
   * Retrieve details for a single city by its unique ID.
   */
  static async getCityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cityId } = req.params;
      const city = await CityService.getCityById(cityId);
      sendSuccess(res, { city }, 'City retrieved successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, error.message || 'Failed to retrieve city', 'CITY_FETCH_ERROR', 500);
    }
  }
}
