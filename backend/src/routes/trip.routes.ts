import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { TripCityController } from '../controllers/tripCity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator.js';
import { addCityToTripSchema, reorderTripCitiesSchema } from '../validators/tripCity.validator.js';

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

export default router;
