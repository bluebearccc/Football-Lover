import { Role, UserStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { usersRepository } from './users.repository';
import { authService } from '../auth/auth.service';
import type { ListUsersQuery } from './users.dto';
import type { Prisma } from '@prisma/client';

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
    const [users, total] = await usersRepository.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });

    const accuracyMap = await usersRepository.getAccuracyMap(users.map((u) => u.id));
    const items = users.map((u) => ({
      ...u,
      accuracy: accuracyMap.get(u.id) ?? null,
    }));

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async getDetail(id: string) {
    const user = await usersRepository.getDetail(id);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    return user;
  },

  async setStatus(actorId: string, targetId: string, status: UserStatus, reason?: string) {
    if (actorId === targetId && status === UserStatus.LOCKED) {
      throw ApiError.badRequest('Bạn không thể tự khoá tài khoản của mình');
    }
    const user = await usersRepository.findById(targetId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');

    if (status === UserStatus.LOCKED && user.role === Role.ADMIN) {
      throw ApiError.badRequest('Không thể khoá tài khoản Admin');
    }

    const banReason = status === UserStatus.LOCKED ? (reason ?? null) : null;
    return usersRepository.setStatus(targetId, status, banReason);
  },

  async setRole(actorId: string, targetId: string, role: Role) {
    if (actorId === targetId && role !== Role.ADMIN) {
      throw ApiError.badRequest('Bạn không thể tự hạ quyền quản trị của mình');
    }
    const user = await usersRepository.findById(targetId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    return usersRepository.setRole(targetId, role);
  },

  async editUser(actorId: string, targetId: string, data: { displayName?: string; role?: Role }) {
    const user = await usersRepository.findById(targetId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');

    if (data.role && actorId === targetId && data.role !== Role.ADMIN) {
      throw ApiError.badRequest('Bạn không thể tự hạ quyền quản trị của mình');
    }

    return usersRepository.update(targetId, data);
  },

  async adminResetPassword(targetId: string) {
    const user = await usersRepository.findById(targetId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    await authService.forgotPassword({ email: user.email });
  },

  async getStats() {
    return usersRepository.getStats();
  },
};
