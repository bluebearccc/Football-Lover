'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminTeamsApi, type TeamInput } from '@/api/admin/teams';
import type { Team } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Button, Card, TextInput } from '@/components/admin/ui';
import { TeamSyncPanel } from '@/components/admin/teams/TeamSyncPanel';
import { DEFAULT_TEAM_LOGO } from '@/lib/format';

const EMPTY: TeamInput = { name: '', shortName: '', logoUrl: '' };

type ActiveFilter = 'all' | 'active' | 'inactive';

const TABS: { label: string; value: ActiveFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hoạt động', value: 'active' },
  { label: 'Ngừng hoạt động', value: 'inactive' },
];

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [form, setForm] = useState<TeamInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminTeamsApi.list({ search: search || undefined, pageSize: 100 });
      setTeams(res.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được danh sách đội');
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleTeams = useMemo(() => {
    if (activeFilter === 'active') return teams.filter((t) => t.isActive);
    if (activeFilter === 'inactive') return teams.filter((t) => !t.isActive);
    return teams;
  }, [teams, activeFilter]);

  const stats = useMemo(
    () => ({
      total: teams.length,
      active: teams.filter((t) => t.isActive).length,
      inactive: teams.filter((t) => !t.isActive).length,
      players: teams.reduce((sum, t) => sum + (t._count?.players ?? 0), 0),
    }),
    [teams],
  );

  function reset() {
    setForm(EMPTY);
    setEditingId(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!form.name.trim()) {
      setError('Tên đội không được để trống');
      return;
    }
    setLoading(true);
    try {
      const payload: TeamInput = {
        name: form.name.trim(),
        shortName: form.shortName?.trim() || undefined,
        logoUrl: form.logoUrl?.trim() || undefined,
      };
      if (editingId) {
        await adminTeamsApi.update(editingId, payload);
        setNotice('Đã cập nhật đội bóng');
      } else {
        await adminTeamsApi.create(payload);
        setNotice('Đã tạo đội bóng');
      }
      reset();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Lưu thất bại');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(team: Team) {
    setEditingId(team.id);
    setForm({ name: team.name, shortName: team.shortName ?? '', logoUrl: team.logoUrl ?? '' });
  }

  async function toggleActive(team: Team) {
    setError(null);
    try {
      await adminTeamsApi.update(team.id, { isActive: !team.isActive });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật thất bại');
    }
  }

  async function remove(team: Team) {
    setError(null);
    setNotice(null);
    try {
      const res = await adminTeamsApi.remove(team.id);
      setNotice(res.deleted ? 'Đã xoá đội bóng' : 'Đội đang được dùng trong trận — đã chuyển sang ngừng hoạt động');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xoá thất bại');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Quản lý đội bóng
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Theo dõi danh sách đội, đồng bộ dữ liệu và quản lý cầu thủ.
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
          { label: 'TỔNG SỐ ĐỘI', value: stats.total, icon: 'shield', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'ĐANG HOẠT ĐỘNG', value: stats.active, icon: 'check_circle', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'NGỪNG HOẠT ĐỘNG', value: stats.inactive, icon: 'block', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'TỔNG CẦU THỦ', value: stats.players, icon: 'groups', color: 'text-primary-container', bg: 'bg-primary-container/10' },
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

      <Card title={editingId ? 'Sửa đội bóng' : 'Thêm đội bóng'}>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <TextInput label="Tên đội" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextInput label="Tên viết tắt" value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} />
          <TextInput label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://…" />
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={loading}>
              {editingId ? 'Lưu' : 'Thêm'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={reset}>
                Huỷ
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="mt-6">
        <TeamSyncPanel onSyncComplete={load} />
      </div>

      {/* Filters + Table */}
      <div className="glass-panel rounded-t-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-colors ${
                activeFilter === tab.value
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đội…"
            className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      <div className="glass-panel rounded-b-xl overflow-x-auto border-t-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Đội</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Viết tắt</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Cầu thủ</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Trạng thái</th>
              <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {visibleTeams.map((team) => (
              <tr key={team.id} className="hover:bg-surface-container-highest/50 transition-all duration-200 hover:translate-x-1">
                <td className="p-5">
                  <Link href={`/admin/teams/${team.id}`} className="flex items-center gap-3 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={team.logoUrl ?? DEFAULT_TEAM_LOGO}
                      alt={team.name}
                      className="h-10 w-10 rounded-full object-cover border border-outline-variant/30 flex-shrink-0"
                    />
                    <p className="font-body-lg text-body-lg text-on-surface font-semibold group-hover:text-primary">
                      {team.name}
                    </p>
                  </Link>
                </td>
                <td className="p-5 font-body-sm text-body-sm text-on-surface-variant">{team.shortName ?? '—'}</td>
                <td className="p-5 font-data-mono text-data-mono text-on-surface">{team._count?.players ?? 0}</td>
                <td className="p-5">
                  {team.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">
                      Ngừng
                    </span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/teams/${team.id}`}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                      title="Xem đội"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </Link>
                    <button
                      onClick={() => startEdit(team)}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                      title="Sửa"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => toggleActive(team)}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-secondary"
                      title={team.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {team.isActive ? 'toggle_on' : 'toggle_off'}
                      </span>
                    </button>
                    <button
                      onClick={() => remove(team)}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-tertiary"
                      title="Xoá"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleTeams.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  Chưa có đội bóng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
