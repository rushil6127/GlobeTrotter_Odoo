import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
<<<<<<< HEAD
import cityRoutes from './city.routes.js';
=======
import tripRoutes from './trip.routes.js';
>>>>>>> 9181387ef126496e23c03fb38ba0102d0963f438

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
<<<<<<< HEAD
router.use('/cities', cityRoutes);
=======
router.use('/trips', tripRoutes);
>>>>>>> 9181387ef126496e23c03fb38ba0102d0963f438

export default router;
