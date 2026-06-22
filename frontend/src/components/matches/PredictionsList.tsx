import type { MatchCriterion, MatchPrediction } from '@/api/matches';

interface PredictionsListProps {
  predictions: MatchPrediction[];
  criteria: MatchCriterion[];
  matchStatus: string;
}

export default function PredictionsList({ predictions, criteria, matchStatus }: PredictionsListProps) {
  if (matchStatus === 'SCHEDULED') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">visibility_off</span>
        <p className="font-body-sm text-body-sm">
          Dự đoán sẽ hiển thị khi trận đấu bắt đầu
        </p>
        {predictions.length > 0 && (
          <p className="font-label-caps text-label-caps text-primary mt-2">
            Bạn đã dự đoán {predictions.length} tiêu chí
          </p>
        )}
      </div>
    );
  }

  if (matchStatus === 'CANCELLED') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">block</span>
        <p className="font-body-sm text-body-sm">Trận đấu đã bị hủy</p>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl mb-2">how_to_vote</span>
        <p className="font-body-sm text-body-sm">Chưa có dự đoán nào</p>
      </div>
    );
  }

  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));
  const grouped = new Map<string, MatchPrediction[]>();
  for (const p of predictions) {
    const existing = grouped.get(p.criterionId) ?? [];
    existing.push(p);
    grouped.set(p.criterionId, existing);
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(grouped.entries()).map(([criterionId, preds]) => {
        const criterion = criteriaMap.get(criterionId);
        return (
          <div key={criterionId}>
            <h4 className="font-bold text-on-surface mb-3">
              {criterion?.name ?? 'Tiêu chí'}
            </h4>
            <div className="flex flex-col gap-2">
              {preds.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-surface-container-low rounded-lg p-3 border border-outline-variant/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/20">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                    </div>
                    <span className="font-bold text-on-surface text-sm">{p.user.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded font-label-caps text-label-caps ${
                      p.selectedTeam === 'HOME'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary/10 text-secondary'
                    }`}>
                      {p.selectedTeam === 'HOME' ? 'Đội nhà' : 'Đội khách'}
                    </span>
                    {p.isCorrect !== null && (
                      <span className={`material-symbols-outlined text-sm ${
                        p.isCorrect ? 'text-primary' : 'text-error'
                      }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {p.isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
