import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { TripCityController } from '../controllers/tripCity.controller.js';
import { ItineraryController } from '../controllers/itinerary.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator.js';
import { addCityToTripSchema, reorderTripCitiesSchema } from '../validators/tripCity.validator.js';
import {
  createItineraryItemSchema,
  reorderItinerarySchema,
  getTripItineraryQuerySchema,
} from '../validators/itinerary.validator.js';

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

export default router;
