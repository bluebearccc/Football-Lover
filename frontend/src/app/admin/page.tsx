'use client';

import { useEffect, useState } from 'react';
import { adminDashboardApi } from '@/api/admin/dashboard';
import type { DashboardOverview } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Card } from '@/components/admin/ui';
import { formatDateTime, statusLabel } from '@/lib/format';

const METRICS: { key: keyof DashboardOverview['stats']; label: string }[] = [
  { key: 'users', label: 'Người dùng' },
  { key: 'lockedUsers', label: 'Tài khoản khoá' },
  { key: 'teams', label: 'Đội bóng' },
  { key: 'activeTeams', label: 'Đội đang hoạt động' },
  { key: 'matches', label: 'Tổng số trận' },
  { key: 'liveOrScheduled', label: 'Sắp/đang diễn ra' },
  { key: 'finishedMatches', label: 'Trận đã kết thúc' },
  { key: 'predictions', label: 'Lượt dự đoán' },
  { key: 'comments', label: 'Bình luận' },
  { key: 'hiddenComments', label: 'Bình luận bị ẩn' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminDashboardApi
      .overview()
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Không tải được dữ liệu'));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
      <Banner message={error} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {METRICS.map((m) => (
          <div key={m.key} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-pitch-600">{data ? data.stats[m.key] : '—'}</p>
            <p className="mt-1 text-xs text-ink-700">{m.label}</p>
          </div>
        ))}
      </div>

      <Card title="Trận đấu gần đây">
        {data && data.recentMatches.length > 0 ? (
          <ul className="divide-y divide-ink-100">
            {data.recentMatches.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium">
                  {m.homeTeam?.name ?? '?'} vs {m.awayTeam?.name ?? '?'}
                </span>
                <span className="flex items-center gap-3 text-ink-700">
                  {formatDateTime(m.matchTime)}
                  <Badge tone={m.status === 'FINISHED' ? 'green' : 'neutral'}>{statusLabel(m.status)}</Badge>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-700">Chưa có trận đấu nào.</p>
        )}
      </Card>
    </div>
  );
}
