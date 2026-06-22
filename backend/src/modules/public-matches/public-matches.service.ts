import { MatchStatus, type Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ApiError } from '../../utils/ApiError';
import { publicMatchesRepository } from './public-matches.repository';
import type { ListPublicMatchesQuery } from './public-matches.dto';

export const publicMatchesService = {
  async listPublic(query: ListPublicMatchesQuery) {
    const where: Prisma.MatchWhereInput = {};
    if (query.status && query.status in MatchStatus) {
      where.status = query.status as MatchStatus;
    }
    if (query.from || query.to) {
      where.matchTime = {};
      if (query.from) where.matchTime.gte = query.from;
      if (query.to) where.matchTime.lte = query.to;
    }

    const [items, total] = await publicMatchesRepository.listPublic({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });

    const mapped = items.map((m) => ({
      id: m.id,
      homeTeam: {
        id: m.homeTeam.id,
        name: m.homeTeam.name,
        shortName: m.homeTeam.shortName,
        logoUrl: m.homeTeam.logoUrl,
      },
      awayTeam: {
        id: m.awayTeam.id,
        name: m.awayTeam.name,
        shortName: m.awayTeam.shortName,
        logoUrl: m.awayTeam.logoUrl,
      },
      matchTime: m.matchTime.toISOString(),
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      entryGold: m.entryGold.toFixed(2),
      participantCount: m._count.participations,
      criteriaCount: m._count.criteria,
    }));

    return { items: mapped, total, page: query.page, pageSize: query.pageSize };
  },

  async getDetailedPublic(id: string, viewerId?: string) {
    const match = await publicMatchesRepository.findDetailedPublic(id);
    if (!match) throw ApiError.notFound('Không tìm thấy trận đấu');

    const participantCount = match._count.participations;
    const goldPool = match.entryGold.mul(new Decimal(participantCount)).toFixed(2);

    let predictions: Array<{
      id: string;
      user: { id: string; displayName: string };
      criterionId: string;
      selectedTeam: string;
      isCorrect: boolean | null;
    }> = [];

    if (match.status === MatchStatus.LIVE || match.status === MatchStatus.FINISHED) {
      predictions = match.predictions.map((p) => ({
        id: p.id,
        user: p.user,
        criterionId: p.criterionId,
        selectedTeam: p.selectedTeam,
        isCorrect: p.isCorrect,
      }));
    } else if (match.status === MatchStatus.SCHEDULED && viewerId) {
      predictions = match.predictions
        .filter((p) => p.userId === viewerId)
        .map((p) => ({
          id: p.id,
          user: p.user,
          criterionId: p.criterionId,
          selectedTeam: p.selectedTeam,
          isCorrect: p.isCorrect,
        }));
    }

    return {
      id: match.id,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName,
        logoUrl: match.homeTeam.logoUrl,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName,
        logoUrl: match.awayTeam.logoUrl,
      },
      matchTime: match.matchTime.toISOString(),
      startDate: match.startDate?.toISOString() ?? null,
      endDate: match.endDate?.toISOString() ?? null,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      entryGold: match.entryGold.toFixed(2),
      participantCount,
      goldPool,
      criteria: match.criteria.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        resultTeam: c.resultTeam,
      })),
      statistics: match.statistics.map((s) => ({
        criterionId: s.criterionId,
        totalHomeVotes: s.totalHomeVotes,
        totalAwayVotes: s.totalAwayVotes,
      })),
      comments: match.comments.map((c) => ({
        id: c.id,
        user: c.user,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      predictions,
    };
  },
};
