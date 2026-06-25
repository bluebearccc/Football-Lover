import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { leaderboardController } from './leaderboard.controller';
import { leaderboardQuerySchema, leaderboardMeQuerySchema } from './leaderboard.dto';

export const leaderboardRoutes = Router();

leaderboardRoutes.get(
  '/',
  validateQuery(leaderboardQuerySchema),
  wrap(leaderboardController.getLeaderboard),
);

leaderboardRoutes.get(
  '/me',
  authenticate,
  validateQuery(leaderboardMeQuerySchema),
  wrap(leaderboardController.getMe),
);
