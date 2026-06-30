import { MatchStatus, type Match, type PredictionCriterion } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { criterionTemplateRepository } from '../criterion-templates/criterion-templates.repository';
import { criteriaRepository } from './criteria.repository';
import type { CreateCriterionInput, UpdateCriterionInput } from './criteria.dto';

/** A match is editable for criteria only while SCHEDULED (BR04/BR09 fairness lock). */
function assertEditable(match: Match): void {
  if (match.status !== MatchStatus.SCHEDULED) {
    throw ApiError.badRequest('Trận đã khoá: không thể chỉnh sửa tiêu chí sau khi trận bắt đầu');
  }
}

async function ensureMatch(matchId: string): Promise<Match> {
  const match = await criteriaRepository.findMatch(matchId);
  if (!match) throw ApiError.notFound('Không tìm thấy trận đấu');
  return match;
}

async function ensureCriterion(id: string): Promise<PredictionCriterion> {
  const criterion = await criteriaRepository.findById(id);
  if (!criterion) throw ApiError.notFound('Không tìm thấy tiêu chí');
  return criterion;
}

export const criteriaService = {
  listByMatch(matchId: string): Promise<PredictionCriterion[]> {
    return criteriaRepository.findByMatch(matchId);
  },

  async create(matchId: string, input: CreateCriterionInput): Promise<PredictionCriterion> {
    const match = await ensureMatch(matchId);
    assertEditable(match);
    return criteriaRepository.create({
      name: input.name,
      description: input.description,
      source: input.source,
      match: { connect: { id: matchId } },
    });
  },

  async update(id: string, input: UpdateCriterionInput): Promise<PredictionCriterion> {
    const criterion = await ensureCriterion(id);
    const match = await ensureMatch(criterion.matchId);
    assertEditable(match);
    return criteriaRepository.update(id, {
      name: input.name,
      description: input.description,
      source: input.source,
    });
  },

  /** AC-13/AC-07: do not delete a criterion with predictions; block if match locked. */
  async remove(id: string): Promise<void> {
    const criterion = await ensureCriterion(id);
    const match = await ensureMatch(criterion.matchId);
    assertEditable(match);
    if (await criteriaRepository.hasPredictions(id)) {
      throw ApiError.conflict('Không thể xoá tiêu chí đã có người dự đoán');
    }
    await criteriaRepository.delete(id);
  },

  async deactivate(id: string): Promise<PredictionCriterion> {
    const criterion = await ensureCriterion(id);
    const match = await ensureMatch(criterion.matchId);
    assertEditable(match);
    return criteriaRepository.update(id, { isActive: false });
  },

  async reactivate(id: string): Promise<PredictionCriterion> {
    const criterion = await ensureCriterion(id);
    if (criterion.isActive) {
      throw ApiError.badRequest('Tiêu chí đã ở trạng thái hoạt động');
    }
    const match = await ensureMatch(criterion.matchId);
    assertEditable(match);
    return criteriaRepository.update(id, { isActive: true });
  },

  /** Copies every active CriterionTemplate into the match, skipping names already present. */
  async applyDefaults(matchId: string): Promise<{ created: number }> {
    const match = await ensureMatch(matchId);
    assertEditable(match);
    const [templates, existing] = await Promise.all([
      criterionTemplateRepository.findActive(),
      criteriaRepository.findByMatch(matchId),
    ]);
    const existingNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));
    const toCreate = templates.filter((t) => !existingNames.has(t.name.trim().toLowerCase()));
    if (toCreate.length === 0) return { created: 0 };
    await criteriaRepository.createMany(matchId, toCreate);
    return { created: toCreate.length };
  },
};
