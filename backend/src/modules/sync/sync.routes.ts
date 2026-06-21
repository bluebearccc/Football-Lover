import { Router, type Request, type Response } from 'express';
import { wrap } from '../../utils/asyncHandler';
import { syncService } from './sync.service';

// Mounted under /api/v1/admin/sync (guarded).
export const syncRoutes = Router();

syncRoutes.post(
  '/matches',
  wrap(async (_req: Request, res: Response) => {
    const result = syncService.refreshMatches();
    res.status(200).json(result);
  }),
);
