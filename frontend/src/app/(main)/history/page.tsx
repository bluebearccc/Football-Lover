'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { HistoryResponse } from '@/api/profile';
import { profileApi } from '@/api/profile';
import { session } from '@/lib/session';
import MatchHistoryList from '@/components/profile/MatchHistoryList';
import Pagination from '@/components/matches/Pagination';

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await profileApi.getHistory({ page: p, pageSize: 20 });
      setData(result);
    } catch {
      setError('Không thể tải lịch sử dự đoán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session.getToken()) {
      router.replace('/login');
      return;
    }
    loadHistory(page);
  }, [page, loadHistory, router]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-widget-gap">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Lịch sử dự đoán</h1>
        <p className="text-on-surface-variant font-body-sm text-body-sm mt-1">
          Toàn bộ các trận đấu bạn đã tham gia dự đoán.
        </p>
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
            onClick={() => loadHistory(page)}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity min-h-[44px]"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
          <MatchHistoryList items={data.items} />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
