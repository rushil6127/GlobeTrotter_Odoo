import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.get('/me', authenticate, AuthController.getProfile);
router.put('/me', authenticate, validateBody(updateProfileSchema), AuthController.updateProfile);

export default router;
