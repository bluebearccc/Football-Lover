import type { Request, Response } from 'express';
import type { LeaderboardQuery } from './leaderboard.dto';
import { leaderboardService } from './leaderboard.service';

export const leaderboardController = {
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const result = await leaderboardService.getLeaderboard(
      req.query as unknown as LeaderboardQuery,
    );
    res.status(200).json(result);
  },
};
