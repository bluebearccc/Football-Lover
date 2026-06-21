'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminTeamsApi, type TeamInput } from '@/api/admin/teams';
import type { Team } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, TextInput } from '@/components/admin/ui';
import { TeamSyncPanel } from '@/components/admin/teams/TeamSyncPanel';
import { DEFAULT_TEAM_LOGO } from '@/lib/format';

const EMPTY: TeamInput = { name: '', shortName: '', logoUrl: '' };

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Quản lý đội bóng</h1>
      <Banner message={error} />
      <Banner message={notice} tone="success" />

      <TeamSyncPanel onSyncComplete={load} />

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

      <Card
        title={`Danh sách đội (${teams.length})`}
        action={
          <TextInput placeholder="Tìm theo tên…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-700">
                <th className="py-2">Đội</th>
                <th>Viết tắt</th>
                <th>Cầu thủ</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-ink-50">
                  <td className="py-2 font-medium">
                    <Link href={`/admin/teams/${team.id}`} className="flex items-center gap-2 hover:text-pitch-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={team.logoUrl ?? DEFAULT_TEAM_LOGO} alt={team.name} className="h-6 w-6 rounded-full object-cover" />
                      {team.name}
                    </Link>
                  </td>
                  <td>{team.shortName ?? '—'}</td>
                  <td>{team._count?.players ?? 0}</td>
                  <td>
                    <Badge tone={team.isActive ? 'green' : 'neutral'}>{team.isActive ? 'Hoạt động' : 'Ngừng'}</Badge>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => startEdit(team)}>
                        Sửa
                      </Button>
                      <Button variant="secondary" onClick={() => toggleActive(team)}>
                        {team.isActive ? 'Ngừng' : 'Kích hoạt'}
                      </Button>
                      <Button variant="danger" onClick={() => remove(team)}>
                        Xoá
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-700">
                    Chưa có đội bóng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
