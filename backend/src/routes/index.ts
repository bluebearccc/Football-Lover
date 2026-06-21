import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes';
import { authRoutes } from '../modules/auth/auth.routes';

const router = Router();

// Mount domain modules here. Real UC modules (matches, predictions, teams,
// notifications, ...) follow the same layered pattern as `modules/auth`.
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router;
