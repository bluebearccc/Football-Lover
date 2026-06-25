import { ApiError } from '../../utils/ApiError';
import type { LeaderboardQuery, LeaderboardMeQuery, RankedEntry, LeaderboardPageResult } from './leaderboard.dto';
import { leaderboardRepository } from './leaderboard.repository';

export const leaderboardService = {
  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardPageResult> {
    if (query.month < 1 || query.month > 12) {
      throw ApiError.badRequest('Tháng hoặc năm không hợp lệ');
    }

    const offset = (query.page - 1) * query.pageSize;

    const [rows, total] = await Promise.all([
      leaderboardRepository.getMonthlyWins(query.month, query.year, query.pageSize, offset),
      leaderboardRepository.countMonthlyRankedUsers(query.month, query.year),
    ]);

    let rank = 0;
    let prevWinCount = -1;
    let prevAccuracy: number | null = -1;
    const rankings: RankedEntry[] = rows.map((row, idx) => {
      if (row.winCount !== prevWinCount || row.accuracy !== prevAccuracy) {
        rank = offset + idx + 1;
        prevWinCount = row.winCount;
        prevAccuracy = row.accuracy;
      }
      return {
        rank,
        userId: row.userId,
        displayName: row.displayName,
        winCount: row.winCount,
        totalPoints: row.totalPoints,
        accuracy: row.accuracy,
        winStreak: row.winStreak,
      };
    });

    return {
      month: query.month,
      year: query.year,
      timezone: 'Asia/Ho_Chi_Minh',
      rankings,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async getMyRank(userId: string, query: LeaderboardMeQuery): Promise<RankedEntry | null> {
    const row = await leaderboardRepository.findUserRank(userId, query.month, query.year);
    if (!row) return null;
    return {
      rank: row.rank,
      userId: row.userId,
      displayName: row.displayName,
      winCount: row.winCount,
      totalPoints: row.totalPoints,
      accuracy: row.accuracy,
      winStreak: row.winStreak,
    };
  },
};
