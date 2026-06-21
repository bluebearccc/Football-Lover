import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyExtractor: (req: Request) => string;
  onLimitReached?: (res: Response) => void;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, keyExtractor, onLimitReached } = options;
  const store = new Map<string, RateLimitEntry>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyExtractor(req)?.toLowerCase() ?? '';
    if (!key) {
      next();
      return;
    }

    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      if (onLimitReached) {
        onLimitReached(res);
      } else {
        res.status(429).json({ message: 'Quá nhiều lần thử, vui lòng thử lại sau' });
      }
      return;
    }

    next();
  };
}
