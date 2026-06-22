'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { adminCriteriaApi, adminMatchesApi, type MatchDetail } from '@/api/admin/matches';
import { adminTeamsApi } from '@/api/admin/teams';
import type { ScoringSummary, Team, TeamSide } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, Select, TextInput } from '@/components/admin/ui';
import { formatDateTime, formatGold, statusLabel } from '@/lib/format';

export default function AdminMatchDetailPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [result, setResult] = useState({ homeScore: 0, awayScore: 0 });
  const [summary, setSummary] = useState<ScoringSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ homeTeamId: '', awayTeamId: '', matchTime: '', entryGold: 100, startDate: '', endDate: '' });
  const [editLoading, setEditLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, t] = await Promise.all([
        adminMatchesApi.get(matchId),
        adminTeamsApi.list({ active: 'true', pageSize: 100 }),
      ]);
      setMatch(m);
      setTeams(t.items);
      setResult({ homeScore: m.homeScore ?? 0, awayScore: m.awayScore ?? 0 });
      const localTime = new Date(m.matchTime);
      localTime.setMinutes(localTime.getMinutes() - localTime.getTimezoneOffset());
      const toLocal = (iso: string | null): string => {
        if (!iso) return '';
        const d = new Date(iso);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      };
      setEditForm({
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        matchTime: localTime.toISOString().slice(0, 16),
        entryGold: Number(m.entryGold),
        startDate: toLocal(m.startDate),
        endDate: toLocal(m.endDate),
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được trận đấu');
    }
  }, [matchId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addCriterion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newCriterion.trim()) return;
    try {
      await adminCriteriaApi.create(matchId, { name: newCriterion.trim() });
      setNewCriterion('');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Thêm tiêu chí thất bại');
    }
  }

  async function removeCriterion(id: string) {
    setError(null);
    try {
      await adminCriteriaApi.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xoá tiêu chí thất bại');
    }
  }

  async function deactivateCriterion(id: string) {
    setError(null);
    try {
      await adminCriteriaApi.deactivate(id);
      setNotice('Đã ẩn tiêu chí');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ẩn tiêu chí thất bại');
    }
  }

  async function setCriterionResult(id: string, resultTeam: TeamSide) {
    setError(null);
    try {
      await adminMatchesApi.setCriterionResult(id, resultTeam);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật kết quả tiêu chí thất bại');
    }
  }

  async function submitResult(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await adminMatchesApi.updateResult(matchId, result);
      setSummary(res);
      setNotice(
        res.scored
          ? `Đã tính điểm: ${res.participantCount} người tham gia, ${res.winnerCount} người thắng, pool ${formatGold(res.pool)} gold.`
          : res.reason ?? 'Trận đã được tính điểm trước đó.',
      );
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cập nhật kết quả thất bại');
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (editForm.homeTeamId === editForm.awayTeamId) {
      setError('Đội nhà và đội khách phải khác nhau');
      return;
    }
    setEditLoading(true);
    try {
      await adminMatchesApi.update(matchId, {
        homeTeamId: editForm.homeTeamId,
        awayTeamId: editForm.awayTeamId,
        matchTime: new Date(editForm.matchTime).toISOString(),
        entryGold: editForm.entryGold,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : undefined,
      });
      setNotice('Đã lưu thay đổi');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Lưu thay đổi thất bại');
    } finally {
      setEditLoading(false);
    }
  }

  if (!match) {
    return (
      <div className="flex flex-col gap-4">
        <Banner message={error} />
        <p className="text-ink-700">Đang tải…</p>
      </div>
    );
  }

  const home = match.homeTeam?.name ?? 'Đội nhà';
  const away = match.awayTeam?.name ?? 'Đội khách';
  const editable = match.status === 'SCHEDULED';
  const winners = match.participations.filter((p) => p.isWinner);
  const unresolvedCriteria = match.criteria.filter((c) => c.resultTeam === null);
  const allCriteriaResolved = match.criteria.length > 0 && unresolvedCriteria.length === 0;
  const canScore = allCriteriaResolved && match.status !== 'FINISHED' && match.status !== 'CANCELLED';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/matches" className="text-sm text-pitch-600 hover:underline">
            ← Danh sách trận
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {home} vs {away}
          </h1>
          <p className="text-sm text-ink-700">
            {formatDateTime(match.matchTime)} · Entry gold {formatGold(match.entryGold)} ·{' '}
            <Badge tone={match.status === 'FINISHED' ? 'green' : match.status === 'CANCELLED' ? 'red' : 'neutral'}>
              {statusLabel(match.status)}
            </Badge>
          </p>
        </div>
      </div>

      <Banner message={error} />
      <Banner message={notice} tone="success" />

      {editable && (
        <Card title="Chỉnh sửa thông tin trận">
          <form onSubmit={saveEdit} className="grid gap-3 md:grid-cols-4">
            <Select
              label="Đội nhà"
              value={editForm.homeTeamId}
              onChange={(e) => setEditForm({ ...editForm, homeTeamId: e.target.value })}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <Select
              label="Đội khách"
              value={editForm.awayTeamId}
              onChange={(e) => setEditForm({ ...editForm, awayTeamId: e.target.value })}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <TextInput
              label="Thời gian"
              type="datetime-local"
              value={editForm.matchTime}
              onChange={(e) => setEditForm({ ...editForm, matchTime: e.target.value })}
            />
            <TextInput
              label="Entry gold"
              type="number"
              min={0}
              step="0.01"
              value={editForm.entryGold}
              onChange={(e) => setEditForm({ ...editForm, entryGold: Number(e.target.value) })}
            />
            <TextInput
              label="Ngày bắt đầu"
              type="datetime-local"
              value={editForm.startDate}
              onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
            />
            <TextInput
              label="Ngày kết thúc"
              type="datetime-local"
              value={editForm.endDate}
              onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
            />
            <div className="flex items-end md:col-span-2">
              <Button type="submit" disabled={editLoading}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Tiêu chí dự đoán">
        {editable && (
          <form onSubmit={addCriterion} className="mb-4 flex gap-2">
            <TextInput
              placeholder="Tên tiêu chí (vd: Đội ghi bàn trước)"
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Thêm</Button>
          </form>
        )}
        {match.criteria.length === 0 ? (
          <p className="text-sm text-ink-700">Chưa có tiêu chí nào.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {match.criteria.map((c) => (
              <li key={c.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm${!c.isActive ? ' opacity-50' : ''}`}>
                <span className="font-medium">
                  {c.name}
                  {!c.isActive && <> <Badge tone="neutral">Đã ẩn</Badge></>}
                </span>
                <div className="flex items-center gap-2">
                  {c.isActive && (
                    <>
                      <span className="text-ink-700">Kết quả:</span>
                      <Button
                        variant={c.resultTeam === 'HOME' ? 'primary' : 'secondary'}
                        onClick={() => setCriterionResult(c.id, 'HOME')}
                      >
                        {home}
                      </Button>
                      <Button
                        variant={c.resultTeam === 'AWAY' ? 'primary' : 'secondary'}
                        onClick={() => setCriterionResult(c.id, 'AWAY')}
                      >
                        {away}
                      </Button>
                    </>
                  )}
                  {c.isActive && (
                    <Button variant="secondary" onClick={() => deactivateCriterion(c.id)}>
                      Ẩn
                    </Button>
                  )}
                  {editable && (
                    <Button variant="danger" onClick={() => removeCriterion(c.id)}>
                      Xoá
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Cập nhật kết quả & tính điểm">
        <p className="mb-3 text-sm text-ink-700">
          Đặt kết quả từng tiêu chí ở trên, rồi nhập tỷ số và bấm “Chốt kết quả” để hệ thống chấm điểm, chia
          gold và gửi thông báo (chạy một lần cho mỗi trận).
        </p>
        <form onSubmit={submitResult} className="flex flex-wrap items-end gap-3">
          <TextInput
            label={`Bàn thắng ${home}`}
            type="number"
            min={0}
            value={result.homeScore}
            onChange={(e) => setResult({ ...result, homeScore: Number(e.target.value) })}
            className="w-32"
          />
          <TextInput
            label={`Bàn thắng ${away}`}
            type="number"
            min={0}
            value={result.awayScore}
            onChange={(e) => setResult({ ...result, awayScore: Number(e.target.value) })}
            className="w-32"
          />
          <Button type="submit" disabled={!canScore}>
            Chốt kết quả
          </Button>
        </form>
        {unresolvedCriteria.length > 0 && match.status !== 'FINISHED' && match.status !== 'CANCELLED' && (
          <div className="mt-3 rounded-lg border border-gold-500/30 bg-gold-500/10 p-3 text-sm text-gold-400">
            ⚠ Chưa có kết quả cho {unresolvedCriteria.length} tiêu chí:{' '}
            <strong>{unresolvedCriteria.map((c) => c.name).join(', ')}</strong>.
            Vui lòng đặt kết quả tất cả tiêu chí trước khi chốt.
          </div>
        )}
        {match.criteria.length === 0 && match.status !== 'FINISHED' && match.status !== 'CANCELLED' && (
          <div className="mt-3 rounded-lg border border-gold-500/30 bg-gold-500/10 p-3 text-sm text-gold-400">
            ⚠ Trận chưa có tiêu chí nào. Vui lòng thêm tiêu chí trước khi chốt kết quả.
          </div>
        )}
        {summary && (
          <div className="mt-3 rounded-lg bg-ink-50 p-3 text-sm text-ink-800">
            Pool: <strong>{formatGold(summary.pool)}</strong> gold · Người thắng: {summary.winnerCount} · Mỗi người{' '}
            <strong>{formatGold(summary.goldPerWinner)}</strong> gold ·{' '}
            {summary.leaderboardEligible ? 'Tính vào BXH' : 'Không tính BXH (< 2 người chơi)'}
          </div>
        )}
      </Card>

      <Card title="Người thắng & chia gold">
        {match.participations.length === 0 ? (
          <p className="text-sm text-ink-700">Chưa có người tham gia hoặc trận chưa được chấm điểm.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-700">
                  <th className="py-2">Người chơi</th>
                  <th>Điểm</th>
                  <th>Gold nhận</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {match.participations
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p) => (
                    <tr key={p.id} className="border-b border-ink-50">
                      <td className="py-2 font-mono text-xs">{p.userId.slice(0, 8)}…</td>
                      <td>{p.score}</td>
                      <td>{formatGold(p.goldWon)}</td>
                      <td>{p.isWinner ? <Badge tone="gold">Thắng</Badge> : <Badge>Thua</Badge>}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-ink-700">{winners.length} người thắng.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
