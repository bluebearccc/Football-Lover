import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { trackLastActive } from '../../middleware/lastActive';
import { validateBody } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { predictionsController } from './predictions.controller';
import { submitPredictionSchema } from './predictions.dto';

export const predictionsRoutes = Router();

predictionsRoutes.post(
  '/',
  authenticate,
  trackLastActive,
  validateBody(submitPredictionSchema),
  wrap(predictionsController.submit),
);

predictionsRoutes.get(
  '/match/:matchId/my',
  authenticate,
  wrap(predictionsController.getMyPredictions),
);
