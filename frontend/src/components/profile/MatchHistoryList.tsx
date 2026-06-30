import Link from 'next/link';
import type { HistoryEntry } from '@/api/profile';

interface MatchHistoryListProps {
  items: HistoryEntry[];
}

function formatMatchTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

export default function MatchHistoryList({ items }: MatchHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">history</span>
        <p className="font-body-sm text-body-sm">Bạn chưa tham gia trận đấu nào</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((entry) => (
        <Link
          key={entry.id}
          href={`/matches/${entry.matchId}`}
          className="flex items-center justify-between bg-surface-container-low rounded-lg p-4 border border-outline-variant/10 hover:border-primary/30 transition-colors"
        >
          <div className="flex flex-col">
            <span className="font-bold text-on-surface text-sm">
              {entry.homeTeam.shortName ?? entry.homeTeam.name} vs{' '}
              {entry.awayTeam.shortName ?? entry.awayTeam.name}
            </span>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-xs mt-1">
              {formatMatchTime(entry.matchTime)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {entry.status === 'FINISHED' && (
              <span className="font-data-mono text-data-mono text-on-surface-variant">
                {entry.homeScore ?? 0} - {entry.awayScore ?? 0}
              </span>
            )}
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {entry.score} đúng
            </span>
            <span
              className={`px-2 py-1 rounded font-label-caps text-label-caps ${
                entry.isWinner ? 'bg-primary/10 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant'
              }`}
            >
              {entry.isWinner ? `+${entry.goldWon}` : '0.00'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
