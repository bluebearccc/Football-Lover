import type { ProfileStats } from '@/api/profile';

interface ProfileStatsCardProps {
  stats: ProfileStats;
}

export default function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  const winRate = stats.totalMatches > 0 ? Math.round((stats.totalWins / stats.totalMatches) * 1000) / 10 : 0;

  return (
    <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
      <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">query_stats</span>
        Thống kê
      </h3>

      <div className="mb-6">
        <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant mb-2">
          <span>Tỷ lệ thắng</span>
          <span className="text-primary">{winRate}%</span>
        </div>
        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${winRate}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-highest rounded-lg p-3 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Trận tham gia</p>
          <p className="font-headline-md text-headline-md text-on-surface">{stats.totalMatches}</p>
        </div>
        <div className="bg-surface-container-highest rounded-lg p-3 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Trận thắng</p>
          <p className="font-headline-md text-headline-md text-on-surface">{stats.totalWins}</p>
        </div>
        <div className="bg-surface-container-highest rounded-lg p-3 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Độ chính xác</p>
          <p className="font-headline-md text-headline-md text-on-surface">
            {stats.accuracy !== null ? `${stats.accuracy}%` : '—'}
          </p>
        </div>
        <div className="bg-surface-container-highest rounded-lg p-3 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Tổng gold thắng</p>
          <p className="font-headline-md text-headline-md text-primary">{stats.totalGoldWon}</p>
        </div>
      </div>
    </div>
  );
}
