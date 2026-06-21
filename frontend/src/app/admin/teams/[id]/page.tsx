'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminTeamsApi } from '@/api/admin/teams';
import type { TeamWithPlayers } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { Badge, Banner, Card } from '@/components/admin/ui';
import { PlayerRoster } from '@/components/admin/teams/PlayerRoster';
import { DEFAULT_TEAM_LOGO } from '@/lib/format';

export default function AdminTeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<TeamWithPlayers | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminTeamsApi
      .get(id)
      .then(setTeam)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Không tải được thông tin đội'),
      );
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Banner message={error} />
        <Link href="/admin/teams" className="text-sm text-pitch-500 hover:underline">
          ← Quay lại danh sách đội
        </Link>
      </div>
    );
  }

  if (!team) {
    return <p className="text-sm text-ink-700">Đang tải…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/teams" className="text-sm text-pitch-500 hover:underline">
        ← Quay lại danh sách đội
      </Link>

      <Card>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={team.logoUrl ?? DEFAULT_TEAM_LOGO}
            alt={team.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-ink-900">{team.name}</h1>
            {team.shortName && (
              <p className="text-sm text-ink-600">{team.shortName}</p>
            )}
            <div className="mt-1">
              <Badge tone={team.isActive ? 'green' : 'neutral'}>
                {team.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card title={`Cầu thủ (${team.players.length})`}>
        <PlayerRoster players={team.players} />
      </Card>
    </div>
  );
}
