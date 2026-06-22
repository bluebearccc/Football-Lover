'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MatchListItem, MatchListResponse } from '@/api/matches';
import { matchesApi } from '@/api/matches';
import { ApiError } from '@/api/client';
import MatchFilterBar from '@/components/matches/MatchFilterBar';
import MatchCard from '@/components/matches/MatchCard';
import Pagination from '@/components/matches/Pagination';

export default function MatchListPage() {
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MatchListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await matchesApi.listMatches({
        status: status || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        page,
        pageSize: 20,
      });
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể tải danh sách trận đấu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, [status, dateFrom, dateTo, page]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  function handleStatusChange(newStatus: string): void {
    setStatus(newStatus);
    setPage(1);
  }

  function handleDateFromChange(value: string): void {
    setDateFrom(value);
    setPage(1);
  }

  function handleDateToChange(value: string): void {
    setDateTo(value);
    setPage(1);
  }

  return (
    <>
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <nav className="flex items-center space-x-2 text-on-surface-variant mb-2">
            <span className="font-label-caps text-label-caps uppercase">Predictions</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-caps text-label-caps uppercase text-primary">Live Matches</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-background">Trận đấu</h1>
        </div>
        <MatchFilterBar
          activeStatus={status}
          onStatusChange={handleStatusChange}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
        />
      </div>

      {/* Content */}
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
            onClick={loadMatches}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity min-h-[44px]"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">sports_soccer</span>
          <p className="text-on-surface-variant text-center font-body-lg">
            Không có trận đấu nào
          </p>
        </div>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-widget-gap">
            {data.items.map((match: MatchListItem) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
