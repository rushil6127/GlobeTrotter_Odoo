import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator.js';

const router = Router();

// All trip routes require authentication
router.use(authenticate);

router.get('/', TripController.getTrips);
router.post('/', validateBody(createTripSchema), TripController.createTrip);
router.get('/:tripId', TripController.getTripById);
router.put('/:tripId', validateBody(updateTripSchema), TripController.updateTrip);
router.delete('/:tripId', TripController.deleteTrip);

export default router;
