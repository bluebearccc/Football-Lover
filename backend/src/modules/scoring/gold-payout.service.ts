import { Prisma } from '@prisma/client';
import { computePool, splitTwoDecimals, type DecimalLike } from '../../utils/decimal';

export interface ScoredParticipant {
  userId: string;
  score: number;
}

export interface PaidParticipant extends ScoredParticipant {
  isWinner: boolean;
  goldWon: Prisma.Decimal;
}

export interface PayoutResult {
  pool: Prisma.Decimal;
  winnerCount: number;
  goldPerWinner: Prisma.Decimal;
  participants: PaidParticipant[];
}

/**
 * Gold payout per BR26–BR28:
 * - pool = entry_gold × participant count
 * - winners = participant(s) with the highest score, score must be ≥ 1 (ties share)
 * - gold_won = pool ÷ winnerCount, 2 decimals
 * - highest score 0 → no winner, pool void (all gold_won = 0)
 */
export const goldPayoutService = {
  payout(entryGold: DecimalLike, scored: ScoredParticipant[]): PayoutResult {
    const participantCount = scored.length;
    const pool = computePool(entryGold, participantCount);

    const highest = scored.reduce((max, p) => Math.max(max, p.score), 0);
    const winnersExist = highest >= 1;
    const winnerIds = new Set(
      winnersExist ? scored.filter((p) => p.score === highest).map((p) => p.userId) : [],
    );
    const winnerCount = winnerIds.size;
    const goldPerWinner = winnerCount > 0 ? splitTwoDecimals(pool, winnerCount) : new Prisma.Decimal(0);

    const participants: PaidParticipant[] = scored.map((p) => {
      const isWinner = winnerIds.has(p.userId);
      return {
        userId: p.userId,
        score: p.score,
        isWinner,
        goldWon: isWinner ? goldPerWinner : new Prisma.Decimal(0),
      };
    });

    return { pool, winnerCount, goldPerWinner, participants };
  },
};
