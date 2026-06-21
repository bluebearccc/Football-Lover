import { NotificationType } from '@prisma/client';
import { decimalToString } from '../../utils/decimal';
import type { NotificationPlan, ParticipationPlan } from './scoring.repository';

/**
 * Build win/lose notifications for a finished match (BR30 / AC-14-01).
 * MATCH_WON for winners (with gold_won, 2 decimals), MATCH_LOST otherwise.
 */
export const notificationService = {
  buildResultNotifications(participations: ParticipationPlan[]): NotificationPlan[] {
    return participations.map((p) =>
      p.isWinner
        ? {
            userId: p.userId,
            type: NotificationType.MATCH_WON,
            title: 'Bạn đã thắng trận!',
            body: `Bạn đoán đúng ${p.score} tiêu chí và nhận ${decimalToString(p.goldWon)} gold.`,
          }
        : {
            userId: p.userId,
            type: NotificationType.MATCH_LOST,
            title: 'Kết quả trận đấu',
            body: `Bạn đoán đúng ${p.score} tiêu chí. Chúc may mắn lần sau!`,
          },
    );
  },
};
