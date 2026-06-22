import { CommentStatus, MatchStatus, type Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const listInclude = {
  homeTeam: true,
  awayTeam: true,
  _count: { select: { criteria: true, participations: true } },
} as const;

type MatchListItem = Prisma.MatchGetPayload<{ include: typeof listInclude }>;

const STATUS_ORDER: Record<string, number> = {
  LIVE: 0,
  SCHEDULED: 1,
  FINISHED: 2,
  POSTPONED: 3,
  CANCELLED: 4,
};

export const publicMatchesRepository = {
  async listPublic(params: {
    where: Prisma.MatchWhereInput;
    skip: number;
    take: number;
  }): Promise<[items: MatchListItem[], total: number]> {
    const allItems = await prisma.match.findMany({
      where: params.where,
      include: listInclude,
    });

    allItems.sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 99;
      const sb = STATUS_ORDER[b.status] ?? 99;
      if (sa !== sb) return sa - sb;
      if (
        a.status === MatchStatus.LIVE ||
        a.status === MatchStatus.SCHEDULED
      ) {
        return a.matchTime.getTime() - b.matchTime.getTime();
      }
      return b.matchTime.getTime() - a.matchTime.getTime();
    });

    return [allItems.slice(params.skip, params.skip + params.take), allItems.length];
  },

  findDetailedPublic(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        criteria: { where: { isActive: true }, orderBy: { name: 'asc' } },
        statistics: true,
        comments: {
          where: { status: CommentStatus.VISIBLE },
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, displayName: true } } },
        },
        predictions: {
          include: {
            user: { select: { id: true, displayName: true } },
          },
        },
        _count: { select: { participations: true } },
      },
    });
  },
};
