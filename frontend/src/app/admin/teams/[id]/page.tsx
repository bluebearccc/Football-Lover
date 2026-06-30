'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminTeamsApi } from '@/api/admin/teams';
import type { TeamWithPlayers } from '@/api/admin/types';
import { ApiError } from '@/api/client';
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
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div role="alert" className="rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-body-sm text-tertiary">
          {error}
        </div>
        <Link href="/admin/teams" className="text-sm text-primary hover:underline">
          ← Quay lại danh sách đội
        </Link>
      </div>
    );
  }

  if (!team) {
    return <p className="max-w-7xl mx-auto text-body-sm text-on-surface-variant">Đang tải…</p>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/admin/teams"
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Quay lại danh sách đội
      </Link>

      <div className="glass-panel rounded-xl p-5 mb-6 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={team.logoUrl ?? DEFAULT_TEAM_LOGO}
          alt={team.name}
          className="h-16 w-16 rounded-xl object-cover border border-outline-variant/30"
        />
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{team.name}</h1>
          {team.shortName && <p className="font-body-sm text-body-sm text-on-surface-variant">{team.shortName}</p>}
          <div className="mt-2">
            {team.isActive ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                Hoạt động
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">
                Ngừng hoạt động
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-5">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
          Cầu thủ ({team.players.length})
        </h2>
        <PlayerRoster players={team.players} />
      </div>
    </div>
  );
}
