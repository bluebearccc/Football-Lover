import { MatchStatus, Prisma, TeamSide, type Match } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { criteriaRepository } from '../criteria/criteria.repository';
import { scoringService, type ScoringSummary } from '../scoring/scoring.service';
import { matchesRepository } from './matches.repository';
import type {
  CreateMatchInput,
  ListMatchesQuery,
  UpdateMatchInput,
  UpdateResultInput,
} from './matches.dto';

async function ensureMatch(id: string): Promise<Match> {
  const match = await matchesRepository.findById(id);
  if (!match) throw ApiError.notFound('Không tìm thấy trận đấu');
  return match;
}

async function assertTeams(homeTeamId: string, awayTeamId: string): Promise<void> {
  if (homeTeamId === awayTeamId) {
    throw ApiError.badRequest('Đội nhà và đội khách phải khác nhau'); // BR08
  }
  const [home, away] = await Promise.all([
    matchesRepository.findTeam(homeTeamId),
    matchesRepository.findTeam(awayTeamId),
  ]);
  if (!home || !away) throw ApiError.badRequest('Đội bóng không tồn tại');
  if (!home.isActive || !away.isActive) throw ApiError.badRequest('Đội bóng đã ngừng hoạt động');
}

export const matchesService = {
  async list(query: ListMatchesQuery) {
    const where: Prisma.MatchWhereInput = {};
    if (query.status && query.status in MatchStatus) {
      where.status = query.status as MatchStatus;
    }
    const [items, total] = await matchesRepository.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      sortOrder: query.sortOrder,
    });
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getById(id: string) {
    const match = await matchesRepository.findDetailed(id);
    if (!match) throw ApiError.notFound('Không tìm thấy trận đấu');
    return match;
  },

  async create(input: CreateMatchInput): Promise<Match> {
    await assertTeams(input.homeTeamId, input.awayTeamId);
    return matchesRepository.create({
      matchTime: input.matchTime,
      entryGold: input.entryGold !== undefined ? new Prisma.Decimal(input.entryGold) : undefined,
      homeTeam: { connect: { id: input.homeTeamId } },
      awayTeam: { connect: { id: input.awayTeamId } },
    });
  },

  /** BR09: core fields locked once the match leaves SCHEDULED. */
  async update(id: string, input: UpdateMatchInput): Promise<Match> {
    const match = await ensureMatch(id);
    const touchesCore =
      input.homeTeamId !== undefined ||
      input.awayTeamId !== undefined ||
      input.matchTime !== undefined;
    if (match.status !== MatchStatus.SCHEDULED && touchesCore) {
      throw ApiError.badRequest('Không thể sửa thông tin chính của trận đã bắt đầu');
    }
    const homeTeamId = input.homeTeamId ?? match.homeTeamId;
    const awayTeamId = input.awayTeamId ?? match.awayTeamId;
    if (input.homeTeamId !== undefined || input.awayTeamId !== undefined) {
      await assertTeams(homeTeamId, awayTeamId);
    }
    const updated = await matchesRepository.update(id, {
      matchTime: input.matchTime,
      startDate: input.startDate,
      endDate: input.endDate,
      entryGold: input.entryGold !== undefined ? new Prisma.Decimal(input.entryGold) : undefined,
      homeTeam: input.homeTeamId ? { connect: { id: input.homeTeamId } } : undefined,
      awayTeam: input.awayTeamId ? { connect: { id: input.awayTeamId } } : undefined,
      manuallyEditedAt: new Date(),
    });
    return updated;
  },

  async setEntryGold(id: string, entryGold: number): Promise<Match> {
    await ensureMatch(id);
    if (entryGold < 0) throw ApiError.badRequest('entry_gold không được âm');
    return matchesRepository.update(id, { entryGold: new Prisma.Decimal(entryGold) });
  },

  async setCriterionResult(criterionId: string, resultTeam: TeamSide) {
    const criterion = await matchesRepository.findCriterion(criterionId);
    if (!criterion) throw ApiError.notFound('Không tìm thấy tiêu chí');
    const match = await matchesRepository.findById(criterion.matchId);
    if (!match || match.status !== MatchStatus.FINISHED) {
      throw ApiError.badRequest('Chỉ được đặt kết quả tiêu chí khi trận đã kết thúc');
    }
    return matchesRepository.setCriterionResult(criterionId, resultTeam);
  },

  /** BR11/BR13: set official scores then run scoring + payout + notifications. */
  async updateResult(id: string, input: UpdateResultInput): Promise<ScoringSummary> {
    const match = await ensureMatch(id);
    if (match.status === MatchStatus.CANCELLED) {
      throw ApiError.badRequest('Trận đã huỷ không thể cập nhật kết quả');
    }

    const criteria = await criteriaRepository.findByMatch(id);
    const unresolved = criteria.filter((c) => c.resultTeam === null);
    if (unresolved.length > 0) {
      const names = unresolved.map((c) => c.name).join(', ');
      throw ApiError.badRequest(
        `Chưa có kết quả cho các tiêu chí: ${names}. Vui lòng đặt kết quả tất cả tiêu chí trước khi chốt.`,
      );
    }

    await matchesRepository.update(id, {
      homeScore: input.homeScore,
      awayScore: input.awayScore,
    });
    return scoringService.scoreMatch(id);
  },

  /** BR14/BR30: cancel and void participations. */
  async cancel(id: string): Promise<void> {
    await ensureMatch(id);
    await scoringService.cancelMatch(id);
  },

  /** BR23/AC-06-03: reject hard delete with related data → switch to CANCELLED. */
  async remove(id: string): Promise<{ deleted: boolean }> {
    await ensureMatch(id);
    if (await matchesRepository.hasRelatedData(id)) {
      await scoringService.cancelMatch(id);
      return { deleted: false };
    }
    await matchesRepository.delete(id);
    return { deleted: true };
  },
};
