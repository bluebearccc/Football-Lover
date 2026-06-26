'use client';

import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '@/api/notifications';
import type { NotificationDto } from '@/api/notifications';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onMarkRead: () => void;
  onClose: () => void;
}

export default function NotificationDropdown({ onMarkRead, onClose }: NotificationDropdownProps): JSX.Element {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 20;

  const fetchNotifications = useCallback(async (p: number, append: boolean) => {
    setLoading(true);
    try {
      const result = await notificationsApi.list(p, pageSize);
      setNotifications((prev) => (append ? [...prev, ...result.notifications] : result.notifications));
      setTotal(result.total);
    } catch {
      // error handled by apiFetch (401 redirect)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  function handleClickItem(notification: NotificationDto): void {
    if (!notification.isRead) {
      notificationsApi.markRead(notification.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
      onMarkRead();
    }
    if (notification.matchId) {
      window.location.href = `/matches/${notification.matchId}`;
    }
    onClose();
  }

  async function handleMarkAllRead(): Promise<void> {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onMarkRead();
    } catch {
      // error handled by apiFetch
    }
  }

  function handleLoadMore(): void {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  }

  const hasMore = notifications.length < total;
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[480px] overflow-y-auto bg-surface-container border border-outline-variant/20 rounded-xl shadow-lg z-50">
      <div className="sticky top-0 bg-surface-container border-b border-outline-variant/20 p-3 flex items-center justify-between">
        <h3 className="text-body-lg font-body-lg font-semibold text-on-surface">Thông báo</h3>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-body-sm font-body-sm text-primary hover:text-primary-fixed-dim transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="p-6 text-center text-on-surface-variant text-body-sm font-body-sm">
          Đang tải...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-6 text-center text-on-surface-variant text-body-sm font-body-sm">
          Không có thông báo
        </div>
      ) : (
        <div className="p-1">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onClickItem={handleClickItem} />
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full p-3 text-center text-body-sm font-body-sm text-primary hover:text-primary-fixed-dim transition-colors min-h-[44px]"
            >
              {loading ? 'Đang tải...' : 'Xem thêm'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
