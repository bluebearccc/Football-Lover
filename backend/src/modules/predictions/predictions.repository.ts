import type { TeamSide } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const predictionsRepository = {
  findByUserAndCriterion(userId: string, criterionId: string) {
    return prisma.prediction.findUnique({
      where: { userId_criterionId: { userId, criterionId } },
    });
  },

  findMatchById(matchId: string) {
    return prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, status: true, matchTime: true },
    });
  },

  findCriterionById(criterionId: string) {
    return prisma.predictionCriterion.findUnique({
      where: { id: criterionId },
      select: { id: true, matchId: true, isActive: true },
    });
  },

  findUserPredictionsForMatch(userId: string, matchId: string) {
    return prisma.prediction.findMany({
      where: { userId, matchId },
      include: {
        criterion: { select: { id: true, name: true, description: true, resultTeam: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async upsertPredictionWithStats(
    data: { userId: string; matchId: string; criterionId: string; selectedTeam: TeamSide },
    oldSelectedTeam: TeamSide | null,
  ) {
    return prisma.$transaction(async (tx) => {
      const prediction = await tx.prediction.upsert({
        where: {
          userId_criterionId: { userId: data.userId, criterionId: data.criterionId },
        },
        create: {
          userId: data.userId,
          matchId: data.matchId,
          criterionId: data.criterionId,
          selectedTeam: data.selectedTeam,
        },
        update: { selectedTeam: data.selectedTeam },
      });

      if (oldSelectedTeam && oldSelectedTeam !== data.selectedTeam) {
        const decField =
          oldSelectedTeam === 'HOME' ? 'totalHomeVotes' : 'totalAwayVotes';
        const incField =
          data.selectedTeam === 'HOME' ? 'totalHomeVotes' : 'totalAwayVotes';
        await tx.statistic.upsert({
          where: {
            matchId_criterionId: { matchId: data.matchId, criterionId: data.criterionId },
          },
          create: {
            matchId: data.matchId,
            criterionId: data.criterionId,
            totalHomeVotes: data.selectedTeam === 'HOME' ? 1 : 0,
            totalAwayVotes: data.selectedTeam === 'AWAY' ? 1 : 0,
          },
          update: {
            [decField]: { decrement: 1 },
            [incField]: { increment: 1 },
          },
        });
      } else if (!oldSelectedTeam) {
        const incField =
          data.selectedTeam === 'HOME' ? 'totalHomeVotes' : 'totalAwayVotes';
        await tx.statistic.upsert({
          where: {
            matchId_criterionId: { matchId: data.matchId, criterionId: data.criterionId },
          },
          create: {
            matchId: data.matchId,
            criterionId: data.criterionId,
            totalHomeVotes: data.selectedTeam === 'HOME' ? 1 : 0,
            totalAwayVotes: data.selectedTeam === 'AWAY' ? 1 : 0,
          },
          update: {
            [incField]: { increment: 1 },
          },
        });
      }

      return prediction;
    });
  },
};
