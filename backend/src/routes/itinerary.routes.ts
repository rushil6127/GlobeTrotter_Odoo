import { Router } from 'express';
import { ItineraryController } from '../controllers/itinerary.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import {
  updateItineraryItemSchema,
  itineraryItemIdParamSchema,
} from '../validators/itinerary.validator.js';

const router = Router();

// All item-level itinerary endpoints require authentication
router.use(authenticate);

// GET /api/itinerary/:itemId - Get single itinerary item
router.get('/:itemId', validateParams(itineraryItemIdParamSchema), ItineraryController.getItineraryItemById);

// PUT /api/itinerary/:itemId - Update itinerary item
router.put(
  '/:itemId',
  validateParams(itineraryItemIdParamSchema),
  validateBody(updateItineraryItemSchema),
  ItineraryController.updateItineraryItem
);

// DELETE /api/itinerary/:itemId - Delete itinerary item
router.delete('/:itemId', validateParams(itineraryItemIdParamSchema), ItineraryController.deleteItineraryItem);

export default router;
