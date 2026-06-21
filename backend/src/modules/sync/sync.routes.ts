import { Router } from 'express';
import type { Request, Response } from 'express';
import { validateBody } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { syncTeamsSchema } from '../teams/teams.dto';
import { syncService } from './sync.service';

export const syncRoutes = Router();

syncRoutes.post(
  '/teams',
  validateBody(syncTeamsSchema),
  wrap(async (req: Request, res: Response) => {
    const { leagueId, season } = req.body as { leagueId: number; season?: number };
    const result = await syncService.syncTeamsByLeague(leagueId, season);
    res.status(200).json(result);
  }),
);
