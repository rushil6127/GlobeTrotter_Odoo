import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { TripCityController } from '../controllers/tripCity.controller.js';
import { ItineraryController } from '../controllers/itinerary.controller.js';
import { BudgetController } from '../controllers/budget.controller.js';
import { ShareController } from '../controllers/share.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.middleware.js';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator.js';
import { addCityToTripSchema, reorderTripCitiesSchema } from '../validators/tripCity.validator.js';
import {
  createItineraryItemSchema,
  reorderItinerarySchema,
  getTripItineraryQuerySchema,
} from '../validators/itinerary.validator.js';
import {
  createExpenseSchema,
  tripBudgetParamSchema,
} from '../validators/budget.validator.js';
import {
  createShareLinkSchema,
  tripShareParamSchema,
} from '../validators/share.validator.js';

const router = Router();

// All trip routes require authentication
router.use(authenticate);

// Core Trip CRUD routes
router.get('/', TripController.getTrips);
router.post('/', validateBody(createTripSchema), TripController.createTrip);
router.get('/:tripId', TripController.getTripById);
router.put('/:tripId', validateBody(updateTripSchema), TripController.updateTrip);
router.delete('/:tripId', TripController.deleteTrip);

// Trip City relationship routes
router.get('/:tripId/cities', TripCityController.getTripCities);
router.post('/:tripId/cities', validateBody(addCityToTripSchema), TripCityController.addCityToTrip);
router.put('/:tripId/cities/reorder', validateBody(reorderTripCitiesSchema), TripCityController.reorderTripCities);
router.delete('/:tripId/cities/:cityId', TripCityController.removeCityFromTrip);

// Trip Itinerary routes
router.get('/:tripId/itinerary', validateQuery(getTripItineraryQuerySchema), ItineraryController.getTripItinerary);
router.post('/:tripId/itinerary', validateBody(createItineraryItemSchema), ItineraryController.createItineraryItem);
router.put('/:tripId/itinerary/reorder', validateBody(reorderItinerarySchema), ItineraryController.reorderItineraryItems);

// Trip Budget & Expense routes
router.get('/:tripId/budget', validateParams(tripBudgetParamSchema), BudgetController.getTripBudget);
router.post('/:tripId/expenses', validateParams(tripBudgetParamSchema), validateBody(createExpenseSchema), BudgetController.createExpense);

// Trip Share routes
router.get('/:tripId/share', validateParams(tripShareParamSchema), ShareController.getTripShareStatus);
router.post('/:tripId/share', validateParams(tripShareParamSchema), validateBody(createShareLinkSchema), ShareController.createShareLink);
router.delete('/:tripId/share', validateParams(tripShareParamSchema), ShareController.revokeShareLink);

export default router;
