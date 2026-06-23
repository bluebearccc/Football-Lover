import type { CommentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const commentsRepository = {
  list(params: { where: Prisma.CommentWhereInput; skip: number; take: number }) {
    return Promise.all([
      prisma.comment.findMany({
        where: params.where,
        include: { user: { select: { id: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.comment.count({ where: params.where }),
    ]);
  },

  findById(id: string) {
    return prisma.comment.findUnique({ where: { id } });
  },

  setStatus(id: string, status: CommentStatus) {
    return prisma.comment.update({ where: { id }, data: { status } });
  },

  save(data: { matchId: string; userId: string; content: string }) {
    return prisma.comment.create({
      data,
      include: { user: { select: { id: true, displayName: true } } },
    });
  },

  findMatchById(id: string) {
    return prisma.match.findUnique({ where: { id }, select: { id: true } });
  },
};
