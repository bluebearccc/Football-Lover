'use client';

import type { Player } from '@/api/admin/types';
import { DEFAULT_PLAYER_IMAGE } from '@/lib/format';

interface PlayerRosterProps {
  players: Player[];
}

export function PlayerRoster({ players }: PlayerRosterProps) {
  if (players.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-700">
        Chưa có cầu thủ nào.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-ink-700">
            <th className="py-2">Cầu thủ</th>
            <th>Vị trí</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border-b border-ink-50">
              <td className="flex items-center gap-2 py-2 font-medium">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={player.imageUrl ?? DEFAULT_PLAYER_IMAGE}
                  alt={player.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                {player.name}
              </td>
              <td>{player.position ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
