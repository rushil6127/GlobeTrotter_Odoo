import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { validateQuery, validateParams } from '../middleware/validate.middleware.js';
import {
  getActivitiesQuerySchema,
  activityIdParamSchema,
} from '../validators/activity.validator.js';

const router = Router();

// GET /api/activities - Paginated and filtered activities list
router.get('/', validateQuery(getActivitiesQuerySchema), ActivityController.getActivities);

// GET /api/activities/:activityId - Single activity details with city relation
router.get('/:activityId', validateParams(activityIdParamSchema), ActivityController.getActivityById);

export default router;
