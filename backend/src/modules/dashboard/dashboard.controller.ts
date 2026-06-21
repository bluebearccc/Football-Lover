import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async overview(_req: Request, res: Response): Promise<void> {
    const [stats, recentMatches] = await Promise.all([
      dashboardService.stats(),
      dashboardService.recentMatches(),
    ]);
    res.status(200).json({ stats, recentMatches });
  },
};
