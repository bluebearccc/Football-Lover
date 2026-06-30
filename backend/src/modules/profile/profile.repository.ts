import { MatchStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const profileRepository = {
  findUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        totalPoints: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });
  },

  async getStats(userId: string): Promise<{
    totalMatches: number;
    totalWins: number;
    accuracy: number | null;
    totalGoldWon: string;
  }> {
    const finishedWhere = { userId, match: { status: MatchStatus.FINISHED } } as const;
    const [totalMatches, totalWins, goldAgg, totalPredictions, correctPredictions] = await Promise.all([
      prisma.matchParticipation.count({ where: finishedWhere }),
      prisma.matchParticipation.count({ where: { ...finishedWhere, isWinner: true } }),
      prisma.matchParticipation.aggregate({ where: finishedWhere, _sum: { goldWon: true } }),
      prisma.prediction.count({ where: { userId, isCorrect: { not: null } } }),
      prisma.prediction.count({ where: { userId, isCorrect: true } }),
    ]);

    const accuracy =
      totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 1000) / 10 : null;

    return {
      totalMatches,
      totalWins,
      accuracy,
      totalGoldWon: (goldAgg._sum.goldWon ?? 0).toFixed(2),
    };
  },

  async listHistory(userId: string, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.matchParticipation.findMany({
        where: { userId },
        include: {
          match: {
            include: { homeTeam: true, awayTeam: true },
          },
        },
        orderBy: { match: { matchTime: 'desc' } },
        skip,
        take,
      }),
      prisma.matchParticipation.count({ where: { userId } }),
    ]);
    return { items, total };
  },
};
