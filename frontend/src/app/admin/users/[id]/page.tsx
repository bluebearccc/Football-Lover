'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminUsersApi } from '@/api/admin/users';
import type { HistoryEntry, ProfileResponse } from '@/api/profile';
import { ApiError } from '@/api/client';
import ProfileStatsCard from '@/components/profile/ProfileStatsCard';
import MatchHistoryList from '@/components/profile/MatchHistoryList';
import Pagination from '@/components/matches/Pagination';

function formatJoinDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

/**
 * UC10 — Admin read-only support view. Reuses the self-service ProfileStatsCard /
 * MatchHistoryList components and data shape (FR-006): no edit controls here, those
 * live on the user-management list's EditUserModal/BanModal.
 */
export default function AdminUserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [history, setHistory] = useState<{ items: HistoryEntry[]; total: number; page: number; pageSize: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const [profileResult, historyResult] = await Promise.all([
        adminUsersApi.getProfile(userId),
        adminUsersApi.getHistory(userId, { page: p, pageSize: 20 }),
      ]);
      setProfile(profileResult);
      setHistory(historyResult);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(e instanceof ApiError ? e.message : 'Không thể tải hồ sơ người dùng.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData(page);
  }, [page, loadData]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-widget-gap">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary font-label-caps text-label-caps"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Quay lại danh sách người dùng
      </Link>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {notFound && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">person_off</span>
          <p className="text-on-surface-variant text-center">Không tìm thấy người dùng này.</p>
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

      {!loading && !notFound && !error && profile && history && (
        <>
          <section className="glass-panel rounded-xl p-card-padding">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">person</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">{profile.user.displayName}</h1>
                <p className="text-on-surface-variant font-body-sm text-body-sm">{profile.user.email}</p>
                <p className="text-on-surface-variant font-label-caps text-label-caps mt-1">
                  Tham gia từ {formatJoinDate(profile.user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-outline-variant/10">
              <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-lg">
                <span className="material-symbols-outlined text-primary text-sm">military_tech</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  {profile.monthlyRank ? `Hạng #${profile.monthlyRank.rank} tháng này` : 'Chưa có hạng tháng này'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-lg">
                <span className="material-symbols-outlined text-primary text-sm">stars</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  {profile.user.totalPoints} điểm dự đoán đúng (all-time)
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-widget-gap">
            <div className="lg:col-span-5">
              <ProfileStatsCard stats={profile.stats} />
            </div>

            <div className="lg:col-span-7">
              <div className="glass-panel rounded-xl p-card-padding">
                <h3 className="font-headline-md text-headline-md flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Lịch sử dự đoán
                </h3>
                <MatchHistoryList items={history.items} />
                <Pagination
                  page={history.page}
                  pageSize={history.pageSize}
                  total={history.total}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
