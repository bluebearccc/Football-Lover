import { ApiError } from '../../utils/ApiError';
import { leaderboardRepository } from '../leaderboard/leaderboard.repository';
import { profileRepository } from './profile.repository';
import type { HistoryQuery } from './profile.dto';

function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export const profileService = {
  async getMyProfile(userId: string) {
    const user = await profileRepository.findUser(userId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');

    const { month, year } = currentMonthYear();
    const [stats, monthlyRank] = await Promise.all([
      profileRepository.getStats(userId),
      leaderboardRepository.findUserRank(userId, month, year),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        totalPoints: user.totalPoints,
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
      },
      stats,
      monthlyRank: monthlyRank
        ? {
            rank: monthlyRank.rank,
            winCount: monthlyRank.winCount,
            month,
            year,
          }
        : null,
    };
  },

  async getMyHistory(userId: string, query: HistoryQuery) {
    const skip = (query.page - 1) * query.pageSize;
    const { items, total } = await profileRepository.listHistory(userId, skip, query.pageSize);

    return {
      items: items.map((p) => ({
        id: p.id,
        matchId: p.matchId,
        homeTeam: {
          id: p.match.homeTeam.id,
          name: p.match.homeTeam.name,
          shortName: p.match.homeTeam.shortName,
          logoUrl: p.match.homeTeam.logoUrl,
        },
        awayTeam: {
          id: p.match.awayTeam.id,
          name: p.match.awayTeam.name,
          shortName: p.match.awayTeam.shortName,
          logoUrl: p.match.awayTeam.logoUrl,
        },
        matchTime: p.match.matchTime.toISOString(),
        homeScore: p.match.homeScore,
        awayScore: p.match.awayScore,
        status: p.match.status,
        score: p.score,
        isWinner: p.isWinner,
        goldWon: p.goldWon.toFixed(2),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  },
};
