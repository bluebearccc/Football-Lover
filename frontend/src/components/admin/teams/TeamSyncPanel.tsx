'use client';

import { useState } from 'react';
import { adminTeamsApi } from '@/api/admin/teams';
import type { SyncResult } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Banner, Button, Card, TextInput } from '@/components/admin/ui';

interface TeamSyncPanelProps {
  onSyncComplete: () => void;
}

export function TeamSyncPanel({ onSyncComplete }: TeamSyncPanelProps) {
  const [leagueId, setLeagueId] = useState('');
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleSync(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const lid = Number(leagueId);
    if (!lid || lid <= 0) {
      setError('League ID phải là số dương');
      return;
    }

    setLoading(true);
    try {
      const syncResult = await adminTeamsApi.sync({
        leagueId: lid,
        season: season ? Number(season) : undefined,
      });
      setResult(syncResult);
      onSyncComplete();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Đồng bộ thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Đồng bộ từ api-football">
      <form onSubmit={handleSync} className="flex flex-wrap items-end gap-3">
        <TextInput
          label="League ID (api-football)"
          type="number"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          placeholder="VD: 39"
          required
          className="w-36"
        />
        <TextInput
          label="Mùa giải"
          type="number"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="w-28"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang đồng bộ…' : 'Đồng bộ'}
        </Button>
      </form>

      <Banner message={error} />

      {result && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-on-surface">
          <p className="mb-2 font-semibold text-primary">{result.note}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div>
              <span className="text-on-surface-variant">Đội tạo mới:</span>{' '}
              <strong>{result.teams.created}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Đội cập nhật:</span>{' '}
              <strong>{result.teams.updated}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Đội không đổi:</span>{' '}
              <strong>{result.teams.unchanged}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Cầu thủ tạo mới:</span>{' '}
              <strong>{result.players.created}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Cầu thủ cập nhật:</span>{' '}
              <strong>{result.players.updated}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Cầu thủ không đổi:</span>{' '}
              <strong>{result.players.unchanged}</strong>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
