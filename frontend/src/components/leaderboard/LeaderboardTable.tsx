'use client';

import type { RankedEntry } from '@/api/leaderboard';

interface LeaderboardTableProps {
  rankings: RankedEntry[];
  currentUserId: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function WinStreakIcons({ streak }: { streak: number }) {
  const max = 5;
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-sm ${
            i < streak ? 'text-primary' : 'text-on-surface-variant/30'
          }`}
          style={i < streak ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          local_fire_department
        </span>
      ))}
    </div>
  );
}

function AccuracyBadge({ accuracy, isCurrentUser }: { accuracy: number | null; isCurrentUser: boolean }) {
  const display = accuracy !== null ? `${Math.round(accuracy * 100)}%` : '—';
  return (
    <span
      className={`px-3 py-1 rounded-full font-data-mono ${
        isCurrentUser
          ? 'bg-primary/20 text-primary border border-primary/30'
          : 'bg-surface-container border border-outline-variant/10'
      }`}
    >
      {display}
    </span>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="p-6 bg-surface-container-low flex justify-between items-center">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
      >
        <span className="material-symbols-outlined">chevron_left</span> Previous
      </button>
      <div className="flex items-center gap-2">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors min-h-[44px] min-w-[44px] ${
                p === page
                  ? 'bg-primary text-on-primary font-bold'
                  : 'hover:bg-surface-container-highest text-on-surface-variant cursor-pointer'
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-on-surface-variant hover:text-primary flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
      >
        Next <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}

export default function LeaderboardTable({
  rankings,
  currentUserId,
  page,
  totalPages,
  onPageChange,
}: LeaderboardTableProps) {
  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-3">leaderboard</span>
        <p className="font-body-sm text-body-sm">Chưa có dữ liệu bảng xếp hạng</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10"
      style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-variant/10">
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Rank
              </th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Predictor
              </th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Points
              </th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-center">
                Win Streak
              </th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-right">
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {rankings.map((entry) => {
              const isMe = currentUserId !== null && entry.userId === currentUserId;
              return (
                <tr
                  key={entry.userId}
                  className={
                    isMe
                      ? 'bg-primary-container/5 border-y-2 border-primary shadow-accent-glow'
                      : 'hover:bg-surface-container-highest/50 transition-colors'
                  }
                >
                  <td className={`px-6 py-4 font-data-mono ${isMe ? 'text-primary font-bold' : 'text-on-surface'}`}>
                    {String(entry.rank).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20">
                        <span className="material-symbols-outlined text-on-surface-variant">person</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          {entry.displayName}
                          {isMe && ' (You)'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-data-mono text-primary">
                    {entry.totalPoints.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <WinStreakIcons streak={entry.winStreak} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AccuracyBadge accuracy={entry.accuracy} isCurrentUser={isMe} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
