import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { generateAiItinerarySchema } from '../validators/ai.validator.js';

const router = Router();

// POST /api/ai/generate-itinerary - Generate trip itinerary draft with AI (Generates draft, does not auto-save)
router.post('/generate-itinerary', validateBody(generateAiItinerarySchema), AIController.generateItinerary);

export default router;
