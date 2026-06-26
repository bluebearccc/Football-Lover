import { apiFetch } from './client';
import { session } from '@/lib/session';

export interface NotificationDto {
  id: string;
  type: 'MATCH_WON' | 'MATCH_LOST' | 'MATCH_CANCELLED';
  title: string;
  body: string | null;
  matchId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  updated: number;
}

export const notificationsApi = {
  list(page = 1, pageSize = 20): Promise<NotificationListResponse> {
    const token = session.getToken();
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return apiFetch<NotificationListResponse>(`/notifications?${params.toString()}`, { token: token ?? undefined });
  },

  unreadCount(): Promise<UnreadCountResponse> {
    const token = session.getToken();
    return apiFetch<UnreadCountResponse>('/notifications/unread-count', { token: token ?? undefined });
  },

  markRead(id: string): Promise<{ message: string }> {
    const token = session.getToken();
    return apiFetch<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH',
      token: token ?? undefined,
    });
  },

  markAllRead(): Promise<MarkAllReadResponse> {
    const token = session.getToken();
    return apiFetch<MarkAllReadResponse>('/notifications/mark-all-read', {
      method: 'PATCH',
      token: token ?? undefined,
    });
  },
};
