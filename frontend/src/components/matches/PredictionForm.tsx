'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MatchCriterion, MatchPrediction, MatchTeam } from '@/api/matches';
import { predictionsApi } from '@/api/predictions';
import { ApiError } from '@/api/client';

interface PredictionFormProps {
  matchId: string;
  criteria: MatchCriterion[];
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  existingPredictions: MatchPrediction[];
  onPredictionSubmitted: () => void;
}

export default function PredictionForm({
  matchId,
  criteria,
  homeTeam,
  awayTeam,
  existingPredictions,
  onPredictionSubmitted,
}: PredictionFormProps) {
  const [selections, setSelections] = useState<Map<string, 'HOME' | 'AWAY'>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const initial = new Map<string, 'HOME' | 'AWAY'>();
    for (const p of existingPredictions) {
      initial.set(p.criterionId, p.selectedTeam);
    }
    setSelections(initial);
  }, [existingPredictions]);

  const existingMap = useMemo(
    () => new Map(existingPredictions.map((p) => [p.criterionId, p.selectedTeam])),
    [existingPredictions],
  );

  const hasChanges = Array.from(selections.entries()).some(
    ([criterionId, team]) => existingMap.get(criterionId) !== team,
  );

  const handleSelect = useCallback((criterionId: string, team: 'HOME' | 'AWAY') => {
    setSelections((prev) => {
      const next = new Map(prev);
      next.set(criterionId, team);
      return next;
    });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    const changedEntries = Array.from(selections.entries()).filter(
      ([criterionId, team]) => existingMap.get(criterionId) !== team,
    );

    if (changedEntries.length === 0) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const results = await Promise.allSettled(
        changedEntries.map(([criterionId, team]) =>
          predictionsApi.submit(matchId, criterionId, team),
        ),
      );

      const failures = results.filter((r) => r.status === 'rejected');

      if (failures.length > 0) {
        const firstError = failures[0] as PromiseRejectedResult;
        const message =
          firstError.reason instanceof ApiError
            ? firstError.reason.message
            : 'Có lỗi xảy ra khi lưu dự đoán';
        setError(
          failures.length === changedEntries.length
            ? message
            : `Đã lưu ${changedEntries.length - failures.length}/${changedEntries.length} dự đoán. ${message}`,
        );
      } else {
        setSuccessMessage(
          existingPredictions.length > 0
            ? 'Cập nhật dự đoán thành công!'
            : 'Dự đoán thành công! Bạn đã tham gia Gold Pool.',
        );
      }

      onPredictionSubmitted();
    } finally {
      setSubmitting(false);
    }
  }, [submitting, selections, existingMap, matchId, onPredictionSubmitted, existingPredictions.length]);

  if (criteria.length === 0) {
    return (
      <p className="text-on-surface-variant font-body-sm text-body-sm">
        Chưa có tiêu chí dự đoán cho trận đấu này.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {criteria.map((criterion) => {
        const selected = selections.get(criterion.id);
        return (
          <div key={criterion.id}>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">
              {criterion.name}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelect(criterion.id, 'HOME')}
                disabled={submitting}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all active:scale-95 min-h-[44px] ${
                  selected === 'HOME'
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
                    : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary'
                } disabled:opacity-60`}
              >
                <span className="font-bold text-sm truncate max-w-full">
                  {homeTeam.shortName ?? homeTeam.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect(criterion.id, 'AWAY')}
                disabled={submitting}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all active:scale-95 min-h-[44px] ${
                  selected === 'AWAY'
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
                    : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary'
                } disabled:opacity-60`}
              >
                <span className="font-bold text-sm truncate max-w-full">
                  {awayTeam.shortName ?? awayTeam.name}
                </span>
              </button>
            </div>
          </div>
        );
      })}

      {error && (
        <p className="text-error font-body-sm text-body-sm">{error}</p>
      )}

      {successMessage && (
        <p className="text-primary font-body-sm text-body-sm">{successMessage}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || selections.size === 0 || !hasChanges}
        className="w-full bg-primary py-4 rounded-xl font-bold text-on-primary mt-2 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
      >
        {submitting ? (
          <>
            <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>
            Xác nhận dự đoán
            <span className="material-symbols-outlined">rocket_launch</span>
          </>
        )}
      </button>
    </div>
  );
}
