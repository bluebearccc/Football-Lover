import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { trackLastActive } from '../../middleware/lastActive';
import { validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { profileController } from './profile.controller';
import { historyQuerySchema } from './profile.dto';

export const profileRoutes = Router();

profileRoutes.use(authenticate, trackLastActive);

// UC10
profileRoutes.get('/me', wrap(profileController.getMe));
profileRoutes.get('/history', validateQuery(historyQuerySchema), wrap(profileController.getHistory));
