import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const THROTTLE_MS = 5 * 60 * 1000;
const recentUpdates = new Map<string, number>();

export function trackLastActive(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next();
    return;
  }

  const userId = req.user.id;
  const now = Date.now();
  const lastUpdate = recentUpdates.get(userId);

  if (lastUpdate && now - lastUpdate < THROTTLE_MS) {
    next();
    return;
  }

  recentUpdates.set(userId, now);

  prisma.user
    .update({ where: { id: userId }, data: { lastActiveAt: new Date() }, select: { id: true } })
    .catch(() => {});

  next();
}
