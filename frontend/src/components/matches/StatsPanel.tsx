import type { MatchCriterion, MatchStatistic } from '@/api/matches';

interface StatsPanelProps {
  criteria: MatchCriterion[];
  statistics: MatchStatistic[];
  matchStatus: string;
}

export default function StatsPanel({ criteria, statistics, matchStatus }: StatsPanelProps) {
  if (matchStatus === 'SCHEDULED' || matchStatus === 'POSTPONED') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">visibility_off</span>
        <p className="font-body-sm text-body-sm">Thống kê sẽ hiển thị sau khi trận đấu bắt đầu</p>
      </div>
    );
  }

  if (statistics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">bar_chart</span>
        <p className="font-body-sm text-body-sm">Chưa có thống kê dự đoán</p>
      </div>
    );
  }

  const statMap = new Map(statistics.map((s) => [s.criterionId, s]));

  return (
    <div className="flex flex-col gap-6">
      {criteria.map((c) => {
        const stat = statMap.get(c.id);
        if (!stat) return null;
        const total = stat.totalHomeVotes + stat.totalAwayVotes;
        const homePct = total > 0 ? Math.round((stat.totalHomeVotes / total) * 100) : 50;
        const awayPct = total > 0 ? 100 - homePct : 50;

        return (
          <div key={c.id} className="flex flex-col gap-2">
            <div className="flex justify-between font-data-mono text-sm">
              <span>{stat.totalHomeVotes}</span>
              <span className="text-on-surface-variant uppercase tracking-widest font-label-caps text-label-caps">
                {c.name}
              </span>
              <span>{stat.totalAwayVotes}</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full flex overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${homePct}%` }}
              />
              <div
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: `${awayPct}%` }}
              />
            </div>
            <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
              <span>{homePct}% Đội nhà</span>
              <span>{awayPct}% Đội khách</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
