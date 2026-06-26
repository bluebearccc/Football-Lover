import { prisma } from '../../lib/prisma';

export interface CreateAdminLogData {
  adminId: string;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  status?: string;
}

export interface AdminLogQuery {
  page?: number;
  pageSize?: number;
  action?: string;
  from?: string;
  to?: string;
}

export const adminLogRepository = {
  async create(data: CreateAdminLogData) {
    return prisma.adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        description: data.description,
        entityType: data.entityType,
        entityId: data.entityId,
        status: data.status ?? 'SUCCESS',
      },
    });
  },

  async findMany(query: AdminLogQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (query.action) {
      where.action = query.action;
    }
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          admin: { select: { id: true, displayName: true } },
        },
      }),
      prisma.adminLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await prisma.adminLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count;
  },
};
