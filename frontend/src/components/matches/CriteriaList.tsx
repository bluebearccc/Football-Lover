import type { MatchCriterion } from '@/api/matches';

interface CriteriaListProps {
  criteria: MatchCriterion[];
}

export default function CriteriaList({ criteria }: CriteriaListProps) {
  if (criteria.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">checklist</span>
        <p className="font-body-sm text-body-sm">Chưa có tiêu chí dự đoán</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {criteria.map((c) => (
        <div
          key={c.id}
          className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10 flex items-start gap-3"
        >
          <span className="material-symbols-outlined text-primary mt-0.5">target</span>
          <div className="flex-1">
            <p className="font-bold text-on-surface">{c.name}</p>
            {c.description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {c.description}
              </p>
            )}
            {c.resultTeam && (
              <span className={`inline-block mt-2 px-2 py-0.5 rounded font-label-caps text-label-caps ${
                c.resultTeam === 'HOME'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary/10 text-secondary'
              }`}>
                Kết quả: {c.resultTeam === 'HOME' ? 'Đội nhà' : 'Đội khách'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
