'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { notificationsApi } from '@/api/notifications';
import { session } from '@/lib/session';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell(): JSX.Element {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const fetchUnreadCount = useCallback(async () => {
    const token = session.getToken();
    if (!token) return;
    try {
      const result = await notificationsApi.unreadCount();
      setUnreadCount(result.count);
    } catch {
      // auth error handled by apiFetch
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleToggle(): void {
    setOpen((prev) => !prev);
  }

  function handleMarkRead(): void {
    fetchUnreadCount();
  }

  function handleClose(): void {
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="text-on-surface-variant hover:text-primary transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-error text-on-error text-[11px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onMarkRead={handleMarkRead}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
