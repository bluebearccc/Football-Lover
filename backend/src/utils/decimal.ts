import { Prisma } from '@prisma/client';

/**
 * Gold/money helpers. Gold is stored as Prisma.Decimal (never float) to avoid
 * floating-point drift. Rounding to 2 decimal places happens only at payout time (BR28).
 */

export type DecimalLike = Prisma.Decimal | number | string;

export function toDecimal(value: DecimalLike): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

/** pool = entry_gold × participant count (BR26). */
export function computePool(entryGold: DecimalLike, participantCount: number): Prisma.Decimal {
  return toDecimal(entryGold).mul(participantCount);
}

/** gold_won = pool ÷ winnerCount, floored to 2 decimal places (BR28, FR-GS-004). */
export function splitTwoDecimals(pool: Prisma.Decimal, winnerCount: number): Prisma.Decimal {
  if (winnerCount <= 0) return new Prisma.Decimal(0);
  return pool.div(winnerCount).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
}

/** Serialize a Decimal to a fixed 2-decimal string for API responses. */
export function decimalToString(value: DecimalLike): string {
  return toDecimal(value).toFixed(2);
}
