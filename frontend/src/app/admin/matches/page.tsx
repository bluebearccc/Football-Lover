'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminMatchesApi, type MatchInput } from '@/api/admin/matches';
import { adminTeamsApi } from '@/api/admin/teams';
import type { Match, MatchStatus, Team } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { MatchSyncPanel } from '@/components/admin/matches/MatchSyncPanel';
import { Button, Card, Select, TextInput } from '@/components/admin/ui';
import { formatDateTime, formatGold, statusLabel } from '@/lib/format';

const STATUS_TABS: { label: string; value: MatchStatus | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Sắp diễn ra', value: 'SCHEDULED' },
  { label: 'Đang diễn ra', value: 'LIVE' },
  { label: 'Đã kết thúc', value: 'FINISHED' },
  { label: 'Đã huỷ', value: 'CANCELLED' },
];

function statusBadgeClass(status: MatchStatus): string {
  if (status === 'FINISHED') return 'bg-primary/10 text-primary border border-primary/20';
  if (status === 'LIVE') return 'bg-secondary/10 text-secondary border border-secondary/20';
  if (status === 'CANCELLED' || status === 'POSTPONED') return 'bg-tertiary/10 text-tertiary border border-tertiary/20';
  return 'bg-surface-variant text-on-surface-variant';
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<MatchInput>({ homeTeamId: '', awayTeamId: '', matchTime: '', entryGold: 100 });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MatchStatus | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const load = useCallback(async () => {
    try {
      const [m, t] = await Promise.all([
        adminMatchesApi.list({
          pageSize: 100,
          status: statusFilter || undefined,
          sortOrder,
        }),
        adminTeamsApi.list({ active: 'true', pageSize: 100 }),
      ]);
      setMatches(m.items);
      setTeams(t.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được dữ liệu');
    }
  }, [statusFilter, sortOrder]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: matches.length,
      live: matches.filter((m) => m.status === 'LIVE').length,
      scheduled: matches.filter((m) => m.status === 'SCHEDULED').length,
      finished: matches.filter((m) => m.status === 'FINISHED').length,
    }),
    [matches],
  );

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!form.homeTeamId || !form.awayTeamId || !form.matchTime) {
      setError('Vui lòng chọn hai đội và thời gian trận');
      return;
    }
    if (form.homeTeamId === form.awayTeamId) {
      setError('Đội nhà và đội khách phải khác nhau');
      return;
    }
    setLoading(true);
    try {
      await adminMatchesApi.create({
        homeTeamId: form.homeTeamId,
        awayTeamId: form.awayTeamId,
        matchTime: new Date(form.matchTime).toISOString(),
        entryGold: form.entryGold,
      });
      setNotice('Đã tạo trận đấu');
      setForm({ homeTeamId: '', awayTeamId: '', matchTime: '', entryGold: 100 });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Tạo trận thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id: string) {
    setError(null);
    try {
      await adminMatchesApi.cancel(id);
      setNotice('Đã huỷ trận đấu');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Huỷ thất bại');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Quản lý trận đấu
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Tạo trận, đồng bộ dữ liệu và theo dõi trạng thái các trận đấu.
          </p>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-body-sm text-tertiary">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {notice}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'TỔNG SỐ TRẬN', value: stats.total, icon: 'sports_soccer', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'ĐANG DIỄN RA', value: stats.live, icon: 'sensors', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'SẮP DIỄN RA', value: stats.scheduled, icon: 'schedule', color: 'text-primary-container', bg: 'bg-primary-container/10' },
          { label: 'ĐÃ KẾT THÚC', value: stats.finished, icon: 'flag', color: 'text-tertiary', bg: 'bg-tertiary/10' },
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

      <Card title="Tạo trận đấu">
        <form onSubmit={create} className="grid gap-3 md:grid-cols-5">
          <Select label="Đội nhà" value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}>
            <option value="">— chọn —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select label="Đội khách" value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}>
            <option value="">— chọn —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <TextInput
            label="Thời gian"
            type="datetime-local"
            value={form.matchTime}
            onChange={(e) => setForm({ ...form, matchTime: e.target.value })}
          />
          <TextInput
            label="Entry gold"
            type="number"
            min={0}
            step="0.01"
            value={form.entryGold}
            onChange={(e) => setForm({ ...form, entryGold: Number(e.target.value) })}
          />
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              Tạo trận
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6">
        <MatchSyncPanel onSyncComplete={load} />
      </div>

      {/* Filters + Table */}
      <div className="glass-panel rounded-t-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-base">swap_vert</span>
          Thời gian {sortOrder === 'desc' ? '↓ Mới nhất' : '↑ Cũ nhất'}
        </button>
      </div>

      <div className="glass-panel rounded-b-xl overflow-x-auto border-t-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Trận</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Thời gian</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Entry gold</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Trạng thái</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-surface-container-highest/50 transition-all duration-200 hover:translate-x-1">
                <td className="p-5">
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold">
                    {m.homeTeam?.name ?? '?'} vs {m.awayTeam?.name ?? '?'}
                  </p>
                  {m.status === 'FINISHED' && m.homeScore !== null && (
                    <p className="font-data-mono text-xs text-on-surface-variant">
                      {m.homeScore}–{m.awayScore}
                    </p>
                  )}
                </td>
                <td className="p-5 font-body-sm text-body-sm text-on-surface-variant">{formatDateTime(m.matchTime)}</td>
                <td className="p-5 font-data-mono text-data-mono text-primary">{formatGold(m.entryGold)} GP</td>
                <td className="p-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(m.status)}`}>
                    {statusLabel(m.status)}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/matches/${m.id}`}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                      title="Quản lý"
                    >
                      <span className="material-symbols-outlined text-xl">tune</span>
                    </Link>
                    {m.status !== 'CANCELLED' && m.status !== 'FINISHED' && (
                      <button
                        onClick={() => cancel(m.id)}
                        className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-tertiary"
                        title="Huỷ trận"
                      >
                        <span className="material-symbols-outlined text-xl">cancel</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  Chưa có trận đấu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
