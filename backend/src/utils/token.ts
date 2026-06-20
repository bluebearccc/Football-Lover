import { createHash, randomBytes } from 'node:crypto';

/** Generate a password-reset token: a raw value (emailed) and its hash (stored). */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
}

/** SHA-256 hash; only the hash is ever persisted (never the raw token). */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
