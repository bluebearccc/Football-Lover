import { Prisma, TeamSide, type Match, type PredictionCriterion, type Team } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const matchInclude = {
  homeTeam: true,
  awayTeam: true,
  _count: { select: { predictions: true, comments: true, criteria: true, participations: true } },
} satisfies Prisma.MatchInclude;

export const matchesRepository = {
  list(params: { where: Prisma.MatchWhereInput; skip: number; take: number; sortOrder?: 'asc' | 'desc' }) {
    return Promise.all([
      prisma.match.findMany({
        where: params.where,
        include: matchInclude,
        orderBy: { matchTime: params.sortOrder ?? 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.match.count({ where: params.where }),
    ]);
  },

  findById(id: string): Promise<Match | null> {
    return prisma.match.findUnique({ where: { id } });
  },

  findDetailed(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: { ...matchInclude, criteria: true, participations: true },
    });
  },

  findTeam(id: string): Promise<Team | null> {
    return prisma.team.findUnique({ where: { id } });
  },

  create(data: Prisma.MatchCreateInput): Promise<Match> {
    return prisma.match.create({ data });
  },

  update(id: string, data: Prisma.MatchUpdateInput): Promise<Match> {
    return prisma.match.update({ where: { id }, data });
  },

  findCriterion(id: string): Promise<PredictionCriterion | null> {
    return prisma.predictionCriterion.findUnique({ where: { id } });
  },

  setCriterionResult(id: string, resultTeam: TeamSide): Promise<PredictionCriterion> {
    return prisma.predictionCriterion.update({
      where: { id },
      data: { resultTeam, resolvedAt: new Date() },
    });
  },

  /** BR23 / AC-06-03: a match with related data must not be hard-deleted. */
  async hasRelatedData(id: string): Promise<boolean> {
    const [predictions, comments, participations] = await Promise.all([
      prisma.prediction.count({ where: { matchId: id } }),
      prisma.comment.count({ where: { matchId: id } }),
      prisma.matchParticipation.count({ where: { matchId: id } }),
    ]);
    return predictions + comments + participations > 0;
  },

  async delete(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.predictionCriterion.deleteMany({ where: { matchId: id } }),
      prisma.statistic.deleteMany({ where: { matchId: id } }),
      prisma.match.delete({ where: { id } }),
    ]);
  },

  async upsertMatchByExternalId(data: {
    externalId: string;
    homeTeamId: string;
    awayTeamId: string;
    matchTime: Date;
    homeScore: number | null;
    awayScore: number | null;
  }): Promise<{ match: Match; created: boolean; changed: boolean }> {
    const existing = await prisma.match.findUnique({
      where: { externalId: data.externalId },
    });

    if (!existing) {
      const match = await prisma.match.create({
        data: {
          externalId: data.externalId,
          homeTeam: { connect: { id: data.homeTeamId } },
          awayTeam: { connect: { id: data.awayTeamId } },
          matchTime: data.matchTime,
          homeScore: data.homeScore,
          awayScore: data.awayScore,
        },
      });
      return { match, created: true, changed: false };
    }

    if (existing.manuallyEditedAt) {
      return { match: existing, created: false, changed: false };
    }

    const updates: Prisma.MatchUpdateInput = {};
    let changed = false;

    if (existing.matchTime.getTime() !== data.matchTime.getTime()) {
      updates.matchTime = data.matchTime;
      changed = true;
    }
    if (data.homeScore !== null && existing.homeScore !== data.homeScore) {
      updates.homeScore = data.homeScore;
      changed = true;
    }
    if (data.awayScore !== null && existing.awayScore !== data.awayScore) {
      updates.awayScore = data.awayScore;
      changed = true;
    }

    if (!changed) {
      return { match: existing, created: false, changed: false };
    }

    const match = await prisma.match.update({
      where: { id: existing.id },
      data: updates,
    });
    return { match, created: false, changed: true };
  },
};
