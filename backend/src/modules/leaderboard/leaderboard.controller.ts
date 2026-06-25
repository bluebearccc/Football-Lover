import type { Request, Response } from 'express';
import type { LeaderboardQuery, LeaderboardMeQuery } from './leaderboard.dto';
import { leaderboardService } from './leaderboard.service';

export const leaderboardController = {
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const result = await leaderboardService.getLeaderboard(
      req.query as unknown as LeaderboardQuery,
    );
    res.status(200).json(result);
  },

  async getMe(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await leaderboardService.getMyRank(
      userId,
      req.query as unknown as LeaderboardMeQuery,
    );
    res.status(200).json(result);
  },
};
