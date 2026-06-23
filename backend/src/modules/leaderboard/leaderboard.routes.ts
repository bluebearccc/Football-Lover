import { Router } from 'express';
import { validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { leaderboardController } from './leaderboard.controller';
import { leaderboardQuerySchema } from './leaderboard.dto';

export const leaderboardRoutes = Router();

leaderboardRoutes.get(
  '/',
  validateQuery(leaderboardQuerySchema),
  wrap(leaderboardController.getLeaderboard),
);
