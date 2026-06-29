'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminCommentsApi } from '@/api/admin/comments';
import type { AdminComment, CommentStatus } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Button } from '@/components/admin/ui';
import { formatDateTime, statusLabel } from '@/lib/format';

const TABS: { label: string; value: CommentStatus | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Hiển thị', value: 'VISIBLE' },
  { label: 'Đã ẩn', value: 'HIDDEN' },
  { label: 'Đã xoá', value: 'DELETED' },
];

function statusBadgeClass(status: CommentStatus): string {
  if (status === 'VISIBLE') return 'bg-primary/10 text-primary border border-primary/20';
  if (status === 'HIDDEN') return 'bg-secondary/10 text-secondary border border-secondary/20';
  return 'bg-tertiary/10 text-tertiary border border-tertiary/20';
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [filter, setFilter] = useState<CommentStatus | ''>('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminCommentsApi.list({ status: filter || undefined, pageSize: 100 });
      setComments(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được bình luận');
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: comments.length,
      visible: comments.filter((c) => c.status === 'VISIBLE').length,
      hidden: comments.filter((c) => c.status === 'HIDDEN').length,
      deleted: comments.filter((c) => c.status === 'DELETED').length,
    }),
    [comments],
  );

  async function setStatus(id: string, status: CommentStatus) {
    setError(null);
    try {
      await adminCommentsApi.setStatus(id, status);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật bình luận thất bại');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Kiểm duyệt bình luận
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Theo dõi và xử lý bình luận của người dùng trên các trận đấu.
          </p>
        </div>
      </div>

      {/* Banner */}
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-body-sm text-tertiary">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'TỔNG BÌNH LUẬN', value: stats.total, icon: 'chat', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'HIỂN THỊ', value: stats.visible, icon: 'visibility', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'ĐÃ ẨN', value: stats.hidden, icon: 'visibility_off', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'ĐÃ XOÁ', value: stats.deleted, icon: 'delete', color: 'text-on-surface-variant', bg: 'bg-surface-variant' },
        ].map((card) => (
          <div key={card.label} className="glass-panel p-5 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${card.bg} rounded-lg`}>
                <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              </div>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant">{card.label}</p>
            <h2 className={`font-headline-lg text-headline-lg-mobile ${card.color}`}>
              {card.value.toLocaleString('vi-VN')}
            </h2>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-t-xl p-5 flex items-center gap-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'hover:bg-surface-variant text-on-surface-variant'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="glass-panel rounded-b-xl border-t-0 divide-y divide-outline-variant/10">
        {comments.length === 0 ? (
          <p className="py-12 text-center text-on-surface-variant">Không có bình luận.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-5 hover:bg-surface-container-highest/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {(c.user?.displayName ?? c.userId).slice(0, 2).toUpperCase()}
                  </div>
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                    {c.user?.displayName ?? c.userId.slice(0, 8)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-data-mono text-xs text-on-surface-variant">{formatDateTime(c.createdAt)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(c.status)}`}>
                    {statusLabel(c.status)}
                  </span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface mb-3">{c.content}</p>
              <div className="flex gap-2">
                {c.status !== 'VISIBLE' && (
                  <Button variant="secondary" onClick={() => setStatus(c.id, 'VISIBLE')}>
                    Hiện lại
                  </Button>
                )}
                {c.status !== 'HIDDEN' && (
                  <Button variant="secondary" onClick={() => setStatus(c.id, 'HIDDEN')}>
                    Ẩn
                  </Button>
                )}
                {c.status !== 'DELETED' && (
                  <Button variant="danger" onClick={() => setStatus(c.id, 'DELETED')}>
                    Xoá
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
