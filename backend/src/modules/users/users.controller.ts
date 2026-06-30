import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { adminLogService } from '../admin-log/admin-log.service';
import { profileService } from '../profile/profile.service';
import type { HistoryQuery } from '../profile/profile.dto';
import { usersService } from './users.service';
import type { EditUserInput, ListUsersQuery, SetRoleInput, SetStatusInput } from './users.dto';

function actorId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const usersController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await usersService.list(req.query as unknown as ListUsersQuery);
    res.status(200).json(result);
  },

  async getDetail(req: Request, res: Response): Promise<void> {
    const user = await usersService.getDetail(req.params.id);
    res.status(200).json(user);
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { status, reason } = req.body as SetStatusInput;
    const user = await usersService.setStatus(actorId(req), req.params.id, status, reason);
    await adminLogService.logAction(actorId(req), {
      action: status === 'LOCKED' ? 'USER_LOCK' : 'USER_UNLOCK',
      description:
        status === 'LOCKED'
          ? `Tài khoản ${user.displayName} đã bị khoá. Lý do: ${reason ?? ''}`
          : `Tài khoản ${user.displayName} đã được mở khoá`,
      entityType: 'User',
      entityId: req.params.id,
    });
    res.status(200).json(user);
  },

  async setRole(req: Request, res: Response): Promise<void> {
    const { role } = req.body as SetRoleInput;
    const user = await usersService.setRole(actorId(req), req.params.id, role);
    await adminLogService.logAction(actorId(req), {
      action: 'USER_ROLE_CHANGE',
      description: `Vai trò ${user.displayName} đã được thay đổi thành ${role}`,
      entityType: 'User',
      entityId: req.params.id,
    });
    res.status(200).json(user);
  },

  async editUser(req: Request, res: Response): Promise<void> {
    const data = req.body as EditUserInput;
    const user = await usersService.editUser(actorId(req), req.params.id, data);

    if (data.displayName) {
      await adminLogService.logAction(actorId(req), {
        action: 'USER_EDIT',
        description: `Đã cập nhật tên hiển thị thành "${user.displayName}"`,
        entityType: 'User',
        entityId: req.params.id,
      });
    }
    if (data.role) {
      await adminLogService.logAction(actorId(req), {
        action: 'USER_ROLE_CHANGE',
        description: `Vai trò ${user.displayName} đã được thay đổi thành ${data.role}`,
        entityType: 'User',
        entityId: req.params.id,
      });
    }

    res.status(200).json(user);
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    await usersService.adminResetPassword(req.params.id);
    await adminLogService.logAction(actorId(req), {
      action: 'USER_PASSWORD_RESET',
      description: `Đã gửi email đặt lại mật khẩu cho người dùng`,
      entityType: 'User',
      entityId: req.params.id,
    });
    res.status(200).json({ message: 'Email đặt lại mật khẩu đã được gửi' });
  },

  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await usersService.getStats();
    res.status(200).json(stats);
  },

  // UC10 — Admin support view.
  async getProfile(req: Request, res: Response): Promise<void> {
    const result = await profileService.getMyProfile(req.params.id);
    res.status(200).json(result);
  },

  async getHistory(req: Request, res: Response): Promise<void> {
    const result = await profileService.getMyHistory(req.params.id, req.query as unknown as HistoryQuery);
    res.status(200).json(result);
  },
};
