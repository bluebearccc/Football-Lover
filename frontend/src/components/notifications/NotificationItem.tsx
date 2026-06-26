'use client';

import type { NotificationDto } from '@/api/notifications';

const TYPE_ICONS: Record<NotificationDto['type'], string> = {
  MATCH_WON: 'emoji_events',
  MATCH_LOST: 'thumb_down',
  MATCH_CANCELLED: 'cancel',
};

const TYPE_COLORS: Record<NotificationDto['type'], string> = {
  MATCH_WON: 'text-primary',
  MATCH_LOST: 'text-tertiary',
  MATCH_CANCELLED: 'text-on-surface-variant',
};

interface NotificationItemProps {
  notification: NotificationDto;
  onClickItem: (notification: NotificationDto) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function NotificationItem({ notification, onClickItem }: NotificationItemProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onClickItem(notification)}
      className={`w-full flex items-start gap-3 p-3 text-left transition-colors rounded-lg min-h-[44px] ${
        notification.isRead
          ? 'bg-transparent hover:bg-surface-container-high'
          : 'bg-surface-container-high hover:bg-surface-container-highest'
      }`}
    >
      <span className={`material-symbols-outlined text-xl mt-0.5 flex-shrink-0 ${TYPE_COLORS[notification.type]}`}>
        {TYPE_ICONS[notification.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-body-sm font-body-sm ${notification.isRead ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-label-caps font-label-caps text-on-surface-variant mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </button>
  );
}
