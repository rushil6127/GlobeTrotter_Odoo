import { Router } from 'express';
import { CityController } from '../controllers/city.controller.js';
import { validateQuery, validateParams } from '../middleware/validate.middleware.js';
import {
  getCitiesQuerySchema,
  searchCitiesQuerySchema,
  cityIdParamSchema,
} from '../validators/city.validator.js';

const router = Router();

// GET /api/cities - Paginated list of cities with optional filters and sorting
router.get('/', validateQuery(getCitiesQuerySchema), CityController.getCities);

// GET /api/cities/search?q= - Fast search across city name, country, and description
// NOTE: Must be declared before /:cityId to avoid Express matching 'search' as an ID parameter
router.get('/search', validateQuery(searchCitiesQuerySchema), CityController.searchCities);

// GET /api/cities/:cityId - Get specific city details by ID
router.get('/:cityId', validateParams(cityIdParamSchema), CityController.getCityById);

export default router;
