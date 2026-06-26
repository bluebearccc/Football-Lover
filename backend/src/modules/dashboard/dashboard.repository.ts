import { MatchStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface DateRange {
  from?: string;
  to?: string;
}

function createdAtFilter(range?: DateRange): Record<string, unknown> | undefined {
  if (!range?.from && !range?.to) return undefined;
  return {
    ...(range.from ? { gte: new Date(range.from) } : {}),
    ...(range.to ? { lte: new Date(range.to) } : {}),
  };
}

export const dashboardRepository = {
  countUsers(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.user.count(createdAt ? { where: { createdAt } } : undefined);
  },

  countLockedUsers(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.user.count({ where: { status: 'LOCKED', ...(createdAt ? { createdAt } : {}) } });
  },

  countTeams() {
    return prisma.team.count();
  },

  countActiveTeams() {
    return prisma.team.count({ where: { isActive: true } });
  },

  countMatches(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.match.count(createdAt ? { where: { createdAt } } : undefined);
  },

  countLiveOrScheduled() {
    return prisma.match.count({
      where: { status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] } },
    });
  },

  countFinishedMatches(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.match.count({
      where: { status: MatchStatus.FINISHED, ...(createdAt ? { createdAt } : {}) },
    });
  },

  countPredictions(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.prediction.count(createdAt ? { where: { createdAt } } : undefined);
  },

  countComments(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.comment.count(createdAt ? { where: { createdAt } } : undefined);
  },

  countHiddenComments(range?: DateRange) {
    const createdAt = createdAtFilter(range);
    return prisma.comment.count({
      where: { status: { in: ['HIDDEN', 'DELETED'] }, ...(createdAt ? { createdAt } : {}) },
    });
  },

  async sumGoldPool(range?: DateRange): Promise<string> {
    if (range?.from || range?.to) {
      const from = range.from ? new Date(range.from) : new Date(0);
      const to = range.to ? new Date(range.to) : new Date();
      const result = await prisma.$queryRaw<[{ total: Prisma.Decimal | null }]>(
        Prisma.sql`SELECT COALESCE(SUM(gold_won), 0) AS total FROM match_participations WHERE created_at >= ${from} AND created_at <= ${to}`
      );
      return (result[0]?.total ?? '0').toString();
    }
    const result = await prisma.$queryRaw<[{ total: Prisma.Decimal | null }]>(
      Prisma.sql`SELECT COALESCE(SUM(gold_won), 0) AS total FROM match_participations`
    );
    return (result[0]?.total ?? '0').toString();
  },

  async getTrafficByHour(): Promise<Array<{ bucket: string; count: number }>> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const rows = await prisma.$queryRaw<Array<{ bucket: Date; count: bigint }>>(
      Prisma.sql`
        SELECT DATE_TRUNC('hour', created_at) AS bucket, COUNT(*)::bigint AS count
        FROM predictions
        WHERE created_at >= ${cutoff}
        GROUP BY bucket
        ORDER BY bucket ASC
      `
    );
    return rows.map((r) => ({ bucket: r.bucket.toISOString(), count: Number(r.count) }));
  },

  async getTrafficByDay(): Promise<Array<{ bucket: string; count: number }>> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const rows = await prisma.$queryRaw<Array<{ bucket: Date; count: bigint }>>(
      Prisma.sql`
        SELECT DATE_TRUNC('day', created_at) AS bucket, COUNT(*)::bigint AS count
        FROM predictions
        WHERE created_at >= ${cutoff}
        GROUP BY bucket
        ORDER BY bucket ASC
      `
    );
    return rows.map((r) => ({ bucket: r.bucket.toISOString(), count: Number(r.count) }));
  },

  recentMatches() {
    return prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { homeTeam: true, awayTeam: true },
    });
  },
};
