'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { adminCriteriaApi, adminMatchesApi, type MatchDetail } from '@/api/admin/matches';
import type { ScoringSummary, TeamSide } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Button, Card, TextInput } from '@/components/admin/ui';
import { formatDateTime, formatGold, statusLabel } from '@/lib/format';

export default function AdminMatchDetailPage() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [newCriterion, setNewCriterion] = useState('');
  const [result, setResult] = useState({ homeScore: 0, awayScore: 0 });
  const [summary, setSummary] = useState<ScoringSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const m = await adminMatchesApi.get(matchId);
      setMatch(m);
      setResult({ homeScore: m.homeScore ?? 0, awayScore: m.awayScore ?? 0 });
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
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm">
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
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
          <Button type="submit" disabled={match.status === 'FINISHED' || match.status === 'CANCELLED'}>
            Chốt kết quả
          </Button>
        </form>
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
