import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import cityRoutes from './city.routes.js';
import tripRoutes from './trip.routes.js';
import activityRoutes from './activity.routes.js';
import itineraryRoutes from './itinerary.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/cities', cityRoutes);
router.use('/trips', tripRoutes);
router.use('/activities', activityRoutes);
router.use('/itinerary', itineraryRoutes);

export default router;
