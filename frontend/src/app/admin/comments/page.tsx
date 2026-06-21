'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminCommentsApi } from '@/api/admin/comments';
import type { AdminComment, CommentStatus } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, Select } from '@/components/admin/ui';
import { formatDateTime, statusLabel } from '@/lib/format';

const FILTERS: { value: CommentStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'VISIBLE', label: 'Hiển thị' },
  { value: 'HIDDEN', label: 'Đã ẩn' },
  { value: 'DELETED', label: 'Đã xoá' },
];

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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Kiểm duyệt bình luận</h1>
      <Banner message={error} />

      <Card
        title={`Bình luận (${comments.length})`}
        action={
          <Select value={filter} onChange={(e) => setFilter(e.target.value as CommentStatus | '')} className="w-40">
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        }
      >
        {comments.length === 0 ? (
          <p className="text-sm text-ink-700">Không có bình luận.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-ink-100 p-3 text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{c.user?.displayName ?? c.userId.slice(0, 8)}</span>
                  <span className="flex items-center gap-2 text-ink-700">
                    {formatDateTime(c.createdAt)}
                    <Badge tone={c.status === 'VISIBLE' ? 'green' : 'red'}>{statusLabel(c.status)}</Badge>
                  </span>
                </div>
                <p className="text-ink-800">{c.content}</p>
                <div className="mt-2 flex gap-2">
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
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
