import { Router } from 'express';
import { ShareController } from '../controllers/share.controller.js';
import { validateParams } from '../middleware/validate.middleware.js';
import { shareIdParamSchema } from '../validators/share.validator.js';

const router = Router();

// GET /api/shared/:shareId - Publicly accessible endpoint (No authentication required)
router.get('/:shareId', validateParams(shareIdParamSchema), ShareController.getPublicSharedTrip);

export default router;
