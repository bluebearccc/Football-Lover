import { MatchStatus, NotificationType, Prisma, TeamSide } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface MatchForScoring {
  id: string;
  status: MatchStatus;
  entryGold: Prisma.Decimal;
  homeScore: number | null;
  awayScore: number | null;
  criteria: { id: string; resultTeam: TeamSide | null }[];
  predictions: { id: string; userId: string; criterionId: string; selectedTeam: TeamSide }[];
}

export interface ParticipationPlan {
  userId: string;
  score: number;
  isWinner: boolean;
  goldWon: Prisma.Decimal;
}

export interface NotificationPlan {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
}

export interface ScoringPlan {
  participations: ParticipationPlan[];
  correctPredictionIds: string[];
  incorrectPredictionIds: string[];
  resolvedCriterionIds: string[];
  notifications: NotificationPlan[];
  homeScore: number | null;
  awayScore: number | null;
}

export const scoringRepository = {
  async loadForScoring(matchId: string): Promise<MatchForScoring | null> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        entryGold: true,
        homeScore: true,
        awayScore: true,
        criteria: { select: { id: true, resultTeam: true } },
        predictions: {
          select: { id: true, userId: true, criterionId: true, selectedTeam: true },
        },
      },
    });
    return match;
  },

  async hasParticipations(matchId: string): Promise<boolean> {
    const count = await prisma.matchParticipation.count({ where: { matchId } });
    return count > 0;
  },

  /** Idempotent scoring write: all-or-nothing, skips if already scored. */
  async applyScoring(matchId: string, plan: ScoringPlan): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Guard inside the transaction (BR: run once per match).
      const already = await tx.matchParticipation.count({ where: { matchId } });
      if (already > 0) return;

      for (const p of plan.participations) {
        await tx.matchParticipation.create({
          data: {
            matchId,
            userId: p.userId,
            score: p.score,
            isWinner: p.isWinner,
            goldWon: p.goldWon,
          },
        });
      }

      if (plan.correctPredictionIds.length > 0) {
        await tx.prediction.updateMany({
          where: { id: { in: plan.correctPredictionIds } },
          data: { isCorrect: true },
        });
      }
      if (plan.incorrectPredictionIds.length > 0) {
        await tx.prediction.updateMany({
          where: { id: { in: plan.incorrectPredictionIds } },
          data: { isCorrect: false },
        });
      }
      if (plan.resolvedCriterionIds.length > 0) {
        await tx.predictionCriterion.updateMany({
          where: { id: { in: plan.resolvedCriterionIds } },
          data: { resolvedAt: new Date() },
        });
      }
      if (plan.notifications.length > 0) {
        await tx.notification.createMany({
          data: plan.notifications.map((n) => ({
            userId: n.userId,
            type: n.type,
            title: n.title,
            body: n.body,
            matchId,
          })),
        });
      }

      // Increment all-time points for stats/tiebreak.
      for (const p of plan.participations.filter((x) => x.score > 0)) {
        await tx.user.update({
          where: { id: p.userId },
          data: { totalPoints: { increment: p.score } },
        });
      }

      await tx.match.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.FINISHED,
          homeScore: plan.homeScore ?? undefined,
          awayScore: plan.awayScore ?? undefined,
        },
      });
    });
  },

  /** Cancel: void participations, revert totalPoints, and notify participants (BR14/BR30/FR-GS-009). */
  async applyCancel(matchId: string, participantUserIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const participations = await tx.matchParticipation.findMany({
        where: { matchId },
        select: { userId: true, score: true },
      });

      for (const p of participations.filter((x) => x.score > 0)) {
        await tx.user.update({
          where: { id: p.userId },
          data: { totalPoints: { decrement: p.score } },
        });
      }

      await tx.matchParticipation.deleteMany({ where: { matchId } });
      await tx.prediction.updateMany({ where: { matchId }, data: { isCorrect: null } });
      if (participantUserIds.length > 0) {
        await tx.notification.createMany({
          data: participantUserIds.map((userId) => ({
            userId,
            type: NotificationType.MATCH_CANCELLED,
            title: 'Trận đấu đã bị huỷ',
            body: 'Trận bạn tham gia đã bị huỷ. Kết quả của trận này không được tính.',
            matchId,
          })),
        });
      }
      await tx.match.update({
        where: { id: matchId },
        data: { status: MatchStatus.CANCELLED },
      });
    });
  },
};
