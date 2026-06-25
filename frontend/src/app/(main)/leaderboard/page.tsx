'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardResponse, RankedEntry } from '@/api/leaderboard';
import { leaderboardApi } from '@/api/leaderboard';
import { session } from '@/lib/session';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import Podium from '@/components/leaderboard/Podium';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [myRank, setMyRank] = useState<RankedEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const token = typeof window !== 'undefined' ? session.getToken() : null;
  const isLoggedIn = token !== null;
  const currentUserId = typeof window !== 'undefined' ? session.getUser()?.id ?? null : null;

  const loadData = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const [leaderboard, me] = await Promise.all([
        leaderboardApi.getLeaderboard({ page: p }),
        isLoggedIn ? leaderboardApi.getMyRank() : Promise.resolve(null),
      ]);
      setData(leaderboard);
      setMyRank(me);
    } catch {
      setError('Không thể tải bảng xếp hạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadData(page);
  }, [page, loadData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const topThree = data && page === 1 ? data.rankings.slice(0, 3) : [];
  const tableRankings = data
    ? page === 1
      ? data.rankings.slice(3)
      : data.rankings
    : [];

  const meUserId = myRank?.userId ?? currentUserId;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Leaderboard</h1>
          <p className="text-on-surface-variant font-body-sm">
            Global rankings of the top football predictors.
          </p>
        </div>
        <LeaderboardFilters />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="material-symbols-outlined text-error text-5xl">error_outline</span>
          <p className="text-on-surface-variant text-center">{error}</p>
          <button
            onClick={() => loadData(page)}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity min-h-[44px]"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Podium — only on first page when there are top entries */}
          {topThree.length > 0 && (
            <div className="mb-12">
              <Podium topThree={topThree} />
            </div>
          )}

          {/* Ranking Table — skip when podium already covers all entries */}
          {(tableRankings.length > 0 || topThree.length === 0) && (
            <LeaderboardTable
              rankings={tableRankings}
              currentUserId={meUserId}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
