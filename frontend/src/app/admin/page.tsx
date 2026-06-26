'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { adminDashboardApi } from '@/api/admin/dashboard';
import type { DashboardParams } from '@/api/admin/dashboard';
import { adminCommentsApi } from '@/api/admin/comments';
import type { AdminComment, AdminLogEntry, DashboardOverview, TrafficBucket } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { formatDateTime, formatGold } from '@/lib/format';
import { logStatusBadge } from '@/lib/admin-helpers';

const POLL_INTERVAL = 30_000;

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [hiddenComments, setHiddenComments] = useState<AdminComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'24h' | '7d'>('24h');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(
    async (params?: DashboardParams, signal?: AbortSignal) => {
      try {
        const p: DashboardParams = {
          period: params?.period ?? period,
          ...(filterFrom ? { from: filterFrom } : {}),
          ...(filterTo ? { to: filterTo } : {}),
          ...params,
        };
        const [overview, comments] = await Promise.all([
          adminDashboardApi.overview(p),
          adminCommentsApi.list({ status: 'HIDDEN', pageSize: 3 }),
        ]);
        if (signal?.aborted) return;
        setData(overview);
        setHiddenComments(comments.items);
        setLastUpdated(new Date());
        setError(null);
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof ApiError ? e.message : 'Không tải được dữ liệu');
      }
    },
    [period, filterFrom, filterTo],
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchData(undefined, ac.signal);
    intervalRef.current = setInterval(() => fetchData(undefined, ac.signal), POLL_INTERVAL);
    return () => {
      ac.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  function handlePeriodChange(newPeriod: '24h' | '7d') {
    setPeriod(newPeriod);
  }

  function applyFilter() {
    setShowFilter(false);
    fetchData({ from: filterFrom || undefined, to: filterTo || undefined });
  }

  function clearFilter() {
    setFilterFrom('');
    setFilterTo('');
    setShowFilter(false);
    fetchData({ from: undefined, to: undefined });
  }

  async function handleExport() {
    try {
      await adminDashboardApi.exportCsv({
        ...(filterFrom ? { from: filterFrom } : {}),
        ...(filterTo ? { to: filterTo } : {}),
      });
    } catch {
      setError('Không thể xuất báo cáo. Vui lòng thử lại.');
    }
  }

  const s = data?.stats;
  const traffic = data?.traffic ?? [];
  const recentLogs = data?.recentLogs ?? [];

  const maxTraffic = Math.max(...traffic.map((t) => t.count), 1);

  const todayVN = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col gap-widget-gap">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Admin Overview</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-on-surface-variant text-body-sm">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {todayVN}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary dot-live-pulse inline-block" />
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Hệ thống Live</span>
            {lastUpdated && (
              <span className="text-on-surface-variant text-[10px] ml-2">
                Cập nhật lần cuối:{' '}
                {lastUpdated.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
              </span>
            )}
          </div>
        </div>

        {error && <p className="text-error text-body-sm">{error}</p>}

        <div className="flex gap-2 relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="glass-card px-4 py-2 rounded-lg text-body-sm font-semibold flex items-center gap-2 hover:bg-surface-variant/50 transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
            {(filterFrom || filterTo) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          {showFilter && (
            <div className="absolute right-0 top-12 z-50 glass-card rounded-xl p-4 flex flex-col gap-3 min-w-[280px] border border-outline-variant/30">
              <label className="text-xs text-on-surface-variant font-bold">Từ ngày</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
              />
              <label className="text-xs text-on-surface-variant font-bold">Đến ngày</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={applyFilter}
                  className="flex-1 bg-primary text-on-primary rounded-lg py-2 text-xs font-bold"
                >
                  Áp dụng
                </button>
                <button
                  onClick={clearFilter}
                  className="flex-1 glass-card rounded-lg py-2 text-xs font-bold text-on-surface-variant"
                >
                  Xoá
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-body-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">download</span> Export Report
          </button>
        </div>
      </div>

      {/* ── Key Metrics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-widget-gap">
        {/* Card 1 — Users */}
        <div className="glass-card p-card-padding rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <p className="text-on-surface-variant font-label-caps text-label-caps mb-2">
            Người dùng hoạt động
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">
              {s ? s.users.toLocaleString('vi-VN') : '—'}
            </span>
            {s && s.lockedUsers > 0 && (
              <span className="text-error text-xs font-bold">{s.lockedUsers} khoá</span>
            )}
          </div>
          <div className="mt-4 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{
                width:
                  s && s.users > 0
                    ? `${Math.round(((s.users - s.lockedUsers) / s.users) * 100)}%`
                    : '0%',
              }}
            />
          </div>
        </div>

        {/* Card 2 — Live / Scheduled */}
        <div className="glass-card p-card-padding rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
          <p className="text-on-surface-variant font-label-caps text-label-caps mb-2">
            Trận Live / Sắp diễn ra
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">
              {s ? s.liveOrScheduled : '—'}
            </span>
            <span className="text-secondary text-xs font-bold">Đang theo dõi</span>
          </div>
          <div className="mt-4 flex gap-1 items-end h-6">
            <div className="w-1 bg-secondary/20 h-2 rounded-full" />
            <div className="w-1 bg-secondary/40 h-4 rounded-full" />
            <div className="w-1 bg-secondary/60 h-6 rounded-full" />
            <div className="w-1 bg-secondary/80 h-5 rounded-full" />
            <div className="w-1 bg-secondary h-6 rounded-full" />
          </div>
        </div>

        {/* Card 3 — Predictions */}
        <div className="glass-card p-card-padding rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <p className="text-on-surface-variant font-label-caps text-label-caps mb-2">
            Lượt dự đoán
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">
              {s ? s.predictions.toLocaleString('vi-VN') : '—'}
            </span>
            <span className="text-on-surface-variant text-xs">Tổng cộng</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            <span className="text-xs text-on-surface-variant">
              {s ? `${s.finishedMatches} trận đã kết thúc` : '—'}
            </span>
          </div>
        </div>

        {/* Card 4 — Gold Pool */}
        <div className="glass-card p-card-padding rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          <p className="text-on-surface-variant font-label-caps text-label-caps mb-2">
            Tổng Gold Pool
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">
              {s ? formatGold(s.totalGoldPool) : '—'}
            </span>
            <span className="text-on-surface-variant text-xs">GP</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            <span className="text-xs text-on-surface-variant">Tổng gold đã phân phối</span>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-widget-gap">
        {/* Left: Traffic bar chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-card-padding flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-on-surface">Hoạt động dự đoán</h3>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value as '24h' | '7d')}
              className="bg-surface-container border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-1 focus:ring-primary py-1 px-2 outline-none"
            >
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày</option>
            </select>
          </div>
          <div className="flex-1 min-h-[220px] w-full relative">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {traffic.length > 0 ? (
                traffic.map((t, i) => {
                  const pct = (t.count / maxTraffic) * 100;
                  return (
                    <div
                      key={i}
                      className="rounded-t-lg border-t-2 transition-all"
                      style={{
                        width: `${Math.max(90 / traffic.length, 4)}%`,
                        height: `${Math.max(pct, 2)}%`,
                        background: `rgba(75, 226, 119, ${pct > 70 ? 0.3 : 0.1})`,
                        borderColor: `rgba(75, 226, 119, ${pct > 70 ? 1 : pct / 100 + 0.2})`,
                      }}
                      title={`${t.count} dự đoán`}
                    />
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center text-on-surface-variant text-body-sm">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-l border-outline-variant/30">
              <div className="w-full border-t border-outline-variant/10" />
              <div className="w-full border-t border-outline-variant/10" />
              <div className="w-full border-t border-outline-variant/10" />
              <div className="w-full border-t border-outline-variant/10" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-on-surface-variant font-bold px-2">
            {period === '24h' ? (
              <>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </>
            ) : (
              traffic.map((t, i) => (
                <span key={i}>
                  {new Date(t.bucket).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Right: Platform stats */}
        <div className="glass-card rounded-xl p-card-padding">
          <h3 className="font-headline-md text-on-surface mb-6">Thống kê nền tảng</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-bold text-on-surface">Đội bóng hoạt động</span>
                <span className="text-data-mono text-primary">
                  {s ? `${s.activeTeams}/${s.teams}` : '—'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{
                    width: s && s.teams > 0 ? `${(s.activeTeams / s.teams) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-bold text-on-surface">Trận đã kết thúc</span>
                <span className="text-data-mono text-primary">
                  {s
                    ? `${s.matches > 0 ? Math.round((s.finishedMatches / s.matches) * 100) : 0}%`
                    : '—'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{
                    width:
                      s && s.matches > 0 ? `${(s.finishedMatches / s.matches) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-bold text-on-surface">Tài khoản an toàn</span>
                <span className="text-data-mono text-primary">
                  {s
                    ? `${s.users > 0 ? Math.round(((s.users - s.lockedUsers) / s.users) * 100) : 100}%`
                    : '—'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{
                    width:
                      s && s.users > 0
                        ? `${((s.users - s.lockedUsers) / s.users) * 100}%`
                        : '100%',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-bold text-on-surface">Bình luận sạch</span>
                <span className="text-data-mono text-primary">
                  {s
                    ? `${s.comments > 0 ? Math.round(((s.comments - s.hiddenComments) / s.comments) * 100) : 100}%`
                    : '—'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{
                    width:
                      s && s.comments > 0
                        ? `${((s.comments - s.hiddenComments) / s.comments) * 100}%`
                        : '100%',
                  }}
                />
              </div>
            </div>
          </div>
          <Link
            href="/admin/matches"
            className="block w-full mt-8 py-3 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors border-t border-outline-variant/30 text-center uppercase tracking-widest"
          >
            Xem tất cả trận đấu
          </Link>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-widget-gap pb-6">
        {/* Recent Activity Logs Table */}
        <div className="lg:col-span-3 glass-card rounded-xl overflow-hidden">
          <div className="p-card-padding flex items-center justify-between border-b border-outline-variant/30">
            <h3 className="font-headline-md text-on-surface">Hoạt động gần đây</h3>
            <Link
              href="/admin/logs"
              className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Xem tất cả{' '}
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                    Sự kiện
                  </th>
                  <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                    Người thực hiện
                  </th>
                  <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log: AdminLogEntry) => {
                    const badge = logStatusBadge(log.status);
                    return (
                      <tr key={log.id} className="hover:bg-surface-variant/20 transition-colors">
                        <td className="px-6 py-4 text-data-mono text-xs text-on-surface-variant whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-body-sm text-on-surface font-semibold">
                          {log.description}
                        </td>
                        <td className="px-6 py-4 text-body-sm text-on-surface-variant whitespace-nowrap">
                          {log.admin?.displayName ?? 'System'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-on-surface-variant text-body-sm"
                    >
                      {data ? 'Chưa có hoạt động nào.' : 'Đang tải...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="glass-card rounded-xl p-card-padding flex flex-col">
          <h3 className="font-headline-md text-on-surface mb-4">Hàng đợi kiểm duyệt</h3>
          <div className="space-y-4 flex-1">
            {hiddenComments.length > 0 ? (
              hiddenComments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-surface-container rounded-lg border-l-4 border-error"
                >
                  <p className="text-xs font-bold text-on-surface line-clamp-2">{c.content}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    {c.user?.displayName ?? 'Ẩn danh'} • {formatDateTime(c.createdAt)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/admin/comments"
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Xem xét
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-surface-container rounded-lg border-l-4 border-primary">
                <p className="text-xs font-bold text-on-surface">Không có bình luận bị ẩn</p>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Hệ thống đang hoạt động bình thường
                </p>
              </div>
            )}
          </div>
          <Link
            href="/admin/comments"
            className="block w-full mt-6 py-2 bg-surface-container-highest rounded-lg text-xs font-bold text-center hover:bg-surface-variant transition-colors text-on-surface"
          >
            Đến Kiểm duyệt ({s?.hiddenComments ?? 0})
          </Link>
        </div>
      </div>
    </div>
  );
}
