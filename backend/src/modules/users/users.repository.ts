import type { Prisma, Role, UserStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const publicSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  status: true,
  totalPoints: true,
  banReason: true,
  lastActiveAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicSelect }>;

export const usersRepository = {
  async list(params: { where: Prisma.UserWhereInput; skip: number; take: number }): Promise<[PublicUser[], number]> {
    return Promise.all([
      prisma.user.findMany({
        where: params.where,
        select: publicSelect,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.user.count({ where: params.where }),
    ]);
  },

  async getAccuracyMap(userIds: string[]): Promise<Map<string, number | null>> {
    if (userIds.length === 0) return new Map();

    const [totalRows, correctRows] = await Promise.all([
      prisma.prediction.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, isCorrect: { not: null } },
        _count: { id: true },
      }),
      prisma.prediction.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, isCorrect: true },
        _count: { id: true },
      }),
    ]);

    const totalMap = new Map(totalRows.map((r) => [r.userId, r._count.id]));
    const correctMap = new Map(correctRows.map((r) => [r.userId, r._count.id]));

    const result = new Map<string, number | null>();
    for (const userId of userIds) {
      const total = totalMap.get(userId);
      if (!total) {
        result.set(userId, null);
        continue;
      }
      const correct = correctMap.get(userId) ?? 0;
      result.set(userId, Math.round((correct / total) * 1000) / 10);
    }
    return result;
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  getDetail(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        ...publicSelect,
        _count: { select: { predictions: true, participations: true, comments: true } },
      },
    });
  },

  setStatus(id: string, status: UserStatus, banReason: string | null) {
    return prisma.user.update({
      where: { id },
      data: { status, banReason },
      select: publicSelect,
    });
  },

  setRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role }, select: publicSelect });
  },

  update(id: string, data: { displayName?: string; role?: Role }) {
    return prisma.user.update({ where: { id }, data, select: publicSelect });
  },

  async getStats(): Promise<{ totalUsers: number; onlineNow: number; lockedUsers: number; averageAccuracy: number }> {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [totalUsers, lockedUsers, onlineNow, totalPredictions, correctPredictions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'LOCKED' } }),
      prisma.user.count({ where: { lastActiveAt: { gte: fifteenMinAgo } } }),
      prisma.prediction.count({ where: { isCorrect: { not: null } } }),
      prisma.prediction.count({ where: { isCorrect: true } }),
    ]);

    const averageAccuracy = totalPredictions > 0
      ? Math.round((correctPredictions / totalPredictions) * 1000) / 10
      : 0;

    return { totalUsers, onlineNow, lockedUsers, averageAccuracy };
  },
};
