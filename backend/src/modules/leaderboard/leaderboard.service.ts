import { ApiError } from '../../utils/ApiError';
import type { LeaderboardQuery } from './leaderboard.dto';
import { leaderboardRepository } from './leaderboard.repository';

export interface RankedEntry {
  rank: number;
  userId: string;
  displayName: string;
  winCount: number;
  totalPoints: number;
}

export interface LeaderboardResult {
  month: number;
  year: number;
  timezone: string;
  rankings: RankedEntry[];
}

export const leaderboardService = {
  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardResult> {
    if (query.month < 1 || query.month > 12) {
      throw ApiError.badRequest('Tháng hoặc năm không hợp lệ');
    }

    const rows = await leaderboardRepository.getMonthlyWins(
      query.month,
      query.year,
      query.limit,
    );

    let rank = 0;
    let prevWinCount = -1;
    const rankings: RankedEntry[] = rows.map((row, idx) => {
      if (row.winCount !== prevWinCount) {
        rank = idx + 1;
        prevWinCount = row.winCount;
      }
      return {
        rank,
        userId: row.userId,
        displayName: row.displayName,
        winCount: row.winCount,
        totalPoints: row.totalPoints,
      };
    });

    return {
      month: query.month,
      year: query.year,
      timezone: 'Asia/Ho_Chi_Minh',
      rankings,
    };
  },
};
