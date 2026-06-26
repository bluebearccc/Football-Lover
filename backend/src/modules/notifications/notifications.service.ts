import { ApiError } from '../../utils/ApiError';
import type { NotificationDto, NotificationListResponse, UnreadCountResponse, MarkAllReadResponse } from './notifications.dto';
import { notificationsRepository } from './notifications.repository';

export const notificationsService = {
  async list(userId: string, page: number, pageSize: number): Promise<NotificationListResponse> {
    const { notifications, total } = await notificationsRepository.findByUser(userId, page, pageSize);
    const mapped: NotificationDto[] = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      matchId: n.matchId,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));
    return { notifications: mapped, total, page, pageSize };
  },

  async unreadCount(userId: string): Promise<UnreadCountResponse> {
    const count = await notificationsRepository.countUnread(userId);
    return { count };
  },

  async markRead(id: string, userId: string): Promise<void> {
    const notification = await notificationsRepository.findById(id, userId);
    if (!notification) {
      throw ApiError.notFound('Không tìm thấy thông báo');
    }
    await notificationsRepository.markRead(id, userId);
  },

  async markAllRead(userId: string): Promise<MarkAllReadResponse> {
    const updated = await notificationsRepository.markAllRead(userId);
    return { updated };
  },
};
