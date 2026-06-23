import { ApiError } from '../../utils/ApiError';

export const BANNED_WORDS: Set<string> = new Set();

interface RateEntry {
  count: number;
  window: number;
  lastAt: number;
}

const rateMap = new Map<string, RateEntry>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MIN_INTERVAL_MS = 10_000;

export const moderationService = {
  validateContent(content: string): void {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw ApiError.badRequest('Bình luận không được để trống');
    }
    if (trimmed.length > 1000) {
      throw ApiError.badRequest('Bình luận không được vượt quá 1000 ký tự');
    }
    const lower = trimmed.toLowerCase();
    for (const word of BANNED_WORDS) {
      if (lower.includes(word.toLowerCase())) {
        throw ApiError.badRequest('Bình luận chứa nội dung không được phép');
      }
    }
  },

  checkRateLimit(userId: string): void {
    const now = Date.now();
    const entry = rateMap.get(userId);

    if (entry) {
      if (now - entry.lastAt < MIN_INTERVAL_MS) {
        const retryAfter = Math.ceil((MIN_INTERVAL_MS - (now - entry.lastAt)) / 1000);
        throw ApiError.tooManyRequests('Vui lòng chờ trước khi bình luận tiếp', { retryAfter });
      }
      if (now - entry.window < WINDOW_MS) {
        if (entry.count >= MAX_PER_WINDOW) {
          const retryAfter = Math.ceil((WINDOW_MS - (now - entry.window)) / 1000);
          throw ApiError.tooManyRequests('Quá nhiều bình luận trong 1 phút, vui lòng thử lại sau', { retryAfter });
        }
        entry.count += 1;
        entry.lastAt = now;
      } else {
        entry.count = 1;
        entry.window = now;
        entry.lastAt = now;
      }
    } else {
      rateMap.set(userId, { count: 1, window: now, lastAt: now });
    }
  },
};
