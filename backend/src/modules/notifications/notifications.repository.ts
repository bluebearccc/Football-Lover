import { prisma } from '../../lib/prisma';

export const notificationsRepository = {
  async findByUser(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ notifications: Awaited<ReturnType<typeof prisma.notification.findMany>>; total: number }> {
    const offset = (page - 1) * pageSize;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: pageSize,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total };
  },

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async findById(id: string, userId: string): Promise<{ id: string } | null> {
    return prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true },
    });
  },

  async markRead(id: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  },
};
