import { NotificationType } from '@prisma/client';
import { decimalToString } from '../../utils/decimal';
import type { NotificationPlan, ParticipationPlan } from './scoring.repository';

export interface MatchContext {
  homeName: string;
  awayName: string;
}

export const notificationService = {
  buildResultNotifications(participations: ParticipationPlan[], match: MatchContext): NotificationPlan[] {
    const { homeName, awayName } = match;
    return participations.map((p) =>
      p.isWinner
        ? {
            userId: p.userId,
            type: NotificationType.MATCH_WON,
            title: 'Bạn đã thắng trận!',
            body: `Bạn đã THẮNG trận ${homeName} vs ${awayName} và nhận ${decimalToString(p.goldWon)} gold.`,
          }
        : {
            userId: p.userId,
            type: NotificationType.MATCH_LOST,
            title: 'Kết quả trận đấu',
            body: `Bạn đã thua trận ${homeName} vs ${awayName}.`,
          },
    );
  },
};
