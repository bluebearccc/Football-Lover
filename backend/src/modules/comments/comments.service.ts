import type { CommentStatus, Prisma } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { commentsRepository } from './comments.repository';
import type { ListCommentsQuery } from './comments.dto';

export const commentsService = {
  async list(query: ListCommentsQuery) {
    const where: Prisma.CommentWhereInput = {};
    if (query.matchId) where.matchId = query.matchId;
    if (query.status) where.status = query.status;
    const [items, total] = await commentsRepository.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async setStatus(id: string, status: CommentStatus) {
    const comment = await commentsRepository.findById(id);
    if (!comment) throw ApiError.notFound('Không tìm thấy bình luận');
    return commentsRepository.setStatus(id, status);
  },
};
