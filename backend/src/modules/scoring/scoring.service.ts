import { MatchStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { goldPayoutService, type ScoredParticipant } from './gold-payout.service';
import { notificationService } from './notification.service';
import {
  scoringRepository,
  type MatchForScoring,
  type ParticipationPlan,
  type ScoringPlan,
} from './scoring.repository';

export interface ScoringSummary {
  scored: boolean;
  reason?: string;
  participantCount: number;
  winnerCount: number;
  pool: string;
  goldPerWinner: string;
  leaderboardEligible: boolean; // ≥ 2 participants (BR29)
}

function buildPlan(match: MatchForScoring): { plan: ScoringPlan; summary: ScoringSummary } {
  const resultByCriterion = new Map(
    match.criteria.filter((c) => c.resultTeam !== null).map((c) => [c.id, c.resultTeam]),
  );

  const correctPredictionIds: string[] = [];
  const incorrectPredictionIds: string[] = [];
  const scoreByUser = new Map<string, number>();
  const participants = new Set<string>();

  for (const pred of match.predictions) {
    participants.add(pred.userId);
    if (!scoreByUser.has(pred.userId)) scoreByUser.set(pred.userId, 0);

    const resolved = resultByCriterion.get(pred.criterionId);
    if (resolved === undefined) continue; // criterion not resolved → not scored
    if (pred.selectedTeam === resolved) {
      correctPredictionIds.push(pred.id);
      scoreByUser.set(pred.userId, (scoreByUser.get(pred.userId) ?? 0) + 1);
    } else {
      incorrectPredictionIds.push(pred.id);
    }
  }

  const scored: ScoredParticipant[] = [...participants].map((userId) => ({
    userId,
    score: scoreByUser.get(userId) ?? 0,
  }));

  const payout = goldPayoutService.payout(match.entryGold, scored);

  const participations: ParticipationPlan[] = payout.participants.map((p) => ({
    userId: p.userId,
    score: p.score,
    isWinner: p.isWinner,
    goldWon: p.goldWon,
  }));

  const notifications = notificationService.buildResultNotifications(participations, {
    homeName: match.homeTeam.name,
    awayName: match.awayTeam.name,
  });

  const plan: ScoringPlan = {
    participations,
    correctPredictionIds,
    incorrectPredictionIds,
    resolvedCriterionIds: [...resultByCriterion.keys()],
    notifications,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  };

  const summary: ScoringSummary = {
    scored: true,
    participantCount: participants.size,
    winnerCount: payout.winnerCount,
    pool: payout.pool.toFixed(2),
    goldPerWinner: payout.goldPerWinner.toFixed(2),
    leaderboardEligible: participants.size >= 2,
  };

  return { plan, summary };
}

export const scoringService = {
  /** Score a match and pay out gold once it is FINISHED (idempotent). */
  async scoreMatch(matchId: string): Promise<ScoringSummary> {
    const match = await scoringRepository.loadForScoring(matchId);
    if (!match) throw ApiError.notFound('Không tìm thấy trận đấu');

    if (await scoringRepository.hasParticipations(matchId)) {
      return {
        scored: false,
        reason: 'Trận đã được tính điểm trước đó',
        participantCount: 0,
        winnerCount: 0,
        pool: '0.00',
        goldPerWinner: '0.00',
        leaderboardEligible: false,
      };
    }

    const { plan, summary } = buildPlan(match);
    await scoringRepository.applyScoring(matchId, plan);
    return summary;
  },

  /** Cancel a match: void participations + notify (BR30). */
  async cancelMatch(matchId: string): Promise<void> {
    const match = await scoringRepository.loadForScoring(matchId);
    if (!match) throw ApiError.notFound('Không tìm thấy trận đấu');
    if (match.status === MatchStatus.CANCELLED) return;
    const participantIds = [...new Set(match.predictions.map((p) => p.userId))];
    await scoringRepository.applyCancel(matchId, participantIds, match.homeTeam.name, match.awayTeam.name);
  },
};
