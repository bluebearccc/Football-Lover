'use client';

import type { Player } from '@/api/admin/types';
import { DEFAULT_PLAYER_IMAGE } from '@/lib/format';

interface PlayerRosterProps {
  players: Player[];
}

export function PlayerRoster({ players }: PlayerRosterProps) {
  if (players.length === 0) {
    return (
      <p className="py-12 text-center text-body-sm text-on-surface-variant">
        Chưa có cầu thủ nào.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/20">
            <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Cầu thủ</th>
            <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Vị trí</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-surface-container-highest/50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={player.imageUrl ?? DEFAULT_PLAYER_IMAGE}
                    alt={player.name}
                    className="h-9 w-9 rounded-full object-cover border border-outline-variant/30"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">{player.name}</span>
                </div>
              </td>
              <td className="p-4 font-body-sm text-body-sm text-on-surface-variant">{player.position ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
