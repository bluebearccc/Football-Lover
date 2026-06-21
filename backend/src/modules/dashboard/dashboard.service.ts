import { MatchStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface DashboardStats {
  users: number;
  lockedUsers: number;
  teams: number;
  activeTeams: number;
  matches: number;
  liveOrScheduled: number;
  finishedMatches: number;
  predictions: number;
  comments: number;
  hiddenComments: number;
}

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    const [
      users,
      lockedUsers,
      teams,
      activeTeams,
      matches,
      liveOrScheduled,
      finishedMatches,
      predictions,
      comments,
      hiddenComments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'LOCKED' } }),
      prisma.team.count(),
      prisma.team.count({ where: { isActive: true } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] } } }),
      prisma.match.count({ where: { status: MatchStatus.FINISHED } }),
      prisma.prediction.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: { in: ['HIDDEN', 'DELETED'] } } }),
    ]);
    return {
      users,
      lockedUsers,
      teams,
      activeTeams,
      matches,
      liveOrScheduled,
      finishedMatches,
      predictions,
      comments,
      hiddenComments,
    };
  },

  recentMatches() {
    return prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { homeTeam: true, awayTeam: true },
    });
  },
};
