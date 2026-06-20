import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes';

const router = Router();

// Mount domain modules here. Real UC modules (auth, matches, predictions,
// teams, notifications, ...) follow the same layered pattern as `modules/health`.
router.use('/health', healthRoutes);

export default router;
