import type { Prisma, Role, User, UserStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const publicSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  status: true,
  totalPoints: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const usersRepository = {
  list(params: { where: Prisma.UserWhereInput; skip: number; take: number }) {
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

  findById(id: string): Promise<User | null> {
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

  setStatus(id: string, status: UserStatus) {
    return prisma.user.update({ where: { id }, data: { status }, select: publicSelect });
  },

  setRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role }, select: publicSelect });
  },
};
