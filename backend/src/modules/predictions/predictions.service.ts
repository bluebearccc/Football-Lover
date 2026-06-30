import { MatchStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { predictionsRepository } from './predictions.repository';
import type { SubmitPredictionInput } from './predictions.dto';

export const predictionsService = {
  async submitPrediction(userId: string, input: SubmitPredictionInput) {
    const criterion = await predictionsRepository.findCriterionById(input.criterionId);
    if (!criterion || !criterion.isActive) {
      throw ApiError.notFound('Không tìm thấy tiêu chí dự đoán');
    }

    if (criterion.matchId !== input.matchId) {
      throw ApiError.badRequest('Tiêu chí không thuộc trận đấu này');
    }

    const match = await predictionsRepository.findMatchById(input.matchId);
    if (!match) {
      throw ApiError.notFound('Không tìm thấy trận đấu');
    }

    if (match.status !== MatchStatus.SCHEDULED) {
      throw ApiError.badRequest('Dự đoán đã đóng cho trận đấu này');
    }

    const existing = await predictionsRepository.findByUserAndCriterion(
      userId,
      input.criterionId,
    );

    const oldSelectedTeam = existing?.selectedTeam ?? null;

    if (oldSelectedTeam === input.selectedTeam) {
      return existing!;
    }

    return predictionsRepository.upsertPredictionWithStats(
      {
        userId,
        matchId: input.matchId,
        criterionId: input.criterionId,
        selectedTeam: input.selectedTeam,
      },
      oldSelectedTeam,
    );
  },

  async getUserPredictions(userId: string, matchId: string) {
    return predictionsRepository.findUserPredictionsForMatch(userId, matchId);
  },
};
