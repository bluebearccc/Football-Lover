'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminMatchesApi, type MatchInput } from '@/api/admin/matches';
import { adminTeamsApi } from '@/api/admin/teams';
import type { Match, Team } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, Select, TextInput } from '@/components/admin/ui';
import { formatDateTime, formatGold, statusLabel } from '@/lib/format';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<MatchInput>({ homeTeamId: '', awayTeamId: '', matchTime: '', entryGold: 100 });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, t] = await Promise.all([
        adminMatchesApi.list({ pageSize: 100 }),
        adminTeamsApi.list({ active: 'true', pageSize: 100 }),
      ]);
      setMatches(m.items);
      setTeams(t.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được dữ liệu');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Quản lý trận đấu</h1>
      <Banner message={error} />
      <Banner message={notice} tone="success" />

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

      <Card title={`Danh sách trận (${matches.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-700">
                <th className="py-2">Trận</th>
                <th>Thời gian</th>
                <th>Entry gold</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-b border-ink-50">
                  <td className="py-2 font-medium">
                    {m.homeTeam?.name ?? '?'} vs {m.awayTeam?.name ?? '?'}
                    {m.status === 'FINISHED' && m.homeScore !== null && (
                      <span className="ml-2 text-ink-700">
                        ({m.homeScore}–{m.awayScore})
                      </span>
                    )}
                  </td>
                  <td>{formatDateTime(m.matchTime)}</td>
                  <td>{formatGold(m.entryGold)}</td>
                  <td>
                    <Badge tone={m.status === 'FINISHED' ? 'green' : m.status === 'CANCELLED' ? 'red' : 'neutral'}>
                      {statusLabel(m.status)}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/matches/${m.id}`}>
                        <Button variant="secondary">Quản lý</Button>
                      </Link>
                      {m.status !== 'CANCELLED' && m.status !== 'FINISHED' && (
                        <Button variant="danger" onClick={() => cancel(m.id)}>
                          Huỷ
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-700">
                    Chưa có trận đấu nào.
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
