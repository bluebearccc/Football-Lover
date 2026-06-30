'use client';

import { useState } from 'react';
import { adminMatchesApi } from '@/api/admin/matches';
import type { MatchSyncResult } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Banner, Button, Card, TextInput } from '@/components/admin/ui';

interface MatchSyncPanelProps {
  onSyncComplete: () => void;
}

export function MatchSyncPanel({ onSyncComplete }: MatchSyncPanelProps) {
  const [leagueId, setLeagueId] = useState('');
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchSyncResult | null>(null);

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
      const syncResult = await adminMatchesApi.syncMatches({
        leagueId: lid,
        season: season ? Number(season) : undefined,
      });
      setResult(syncResult);
      onSyncComplete();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Đồng bộ trận đấu thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Đồng bộ trận đấu từ api-football">
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
          {loading ? 'Đang đồng bộ…' : 'Sync trận đấu'}
        </Button>
      </form>

      <Banner message={error} />

      {result && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-on-surface">
          <p className="mb-2 font-semibold text-primary">{result.note}</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-on-surface-variant">Trận tạo mới:</span>{' '}
              <strong>{result.matches.created}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Trận cập nhật:</span>{' '}
              <strong>{result.matches.updated}</strong>
            </div>
            <div>
              <span className="text-on-surface-variant">Trận không đổi:</span>{' '}
              <strong>{result.matches.unchanged}</strong>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
