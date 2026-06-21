import { Role, UserStatus, type Prisma } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { usersRepository } from './users.repository';
import type { ListUsersQuery } from './users.dto';

export const usersService = {
  async list(query: ListUsersQuery) {
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { displayName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await usersRepository.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getDetail(id: string) {
    const user = await usersRepository.getDetail(id);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    return user;
  },

  /** Admin cannot lock their own account (avoid lockout). */
  async setStatus(actorId: string, targetId: string, status: UserStatus) {
    if (actorId === targetId && status === UserStatus.LOCKED) {
      throw ApiError.badRequest('Bạn không thể tự khoá tài khoản của mình');
    }
    const user = await usersRepository.findById(targetId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    return usersRepository.setStatus(targetId, status);
  },

  /** Admin cannot demote their own admin role (avoid lockout). */
  async setRole(actorId: string, targetId: string, role: Role) {
    if (actorId === targetId && role !== Role.ADMIN) {
      throw ApiError.badRequest('Bạn không thể tự hạ quyền quản trị của mình');
    }
    const user = await usersRepository.findById(targetId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    return usersRepository.setRole(targetId, role);
  },
};
