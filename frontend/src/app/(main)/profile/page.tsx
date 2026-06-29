'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProfileResponse, HistoryEntry } from '@/api/profile';
import { profileApi } from '@/api/profile';
import { session } from '@/lib/session';
import ProfileStatsCard from '@/components/profile/ProfileStatsCard';
import MatchHistoryList from '@/components/profile/MatchHistoryList';

function formatJoinDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileResult, historyResult] = await Promise.all([
        profileApi.getMe(),
        profileApi.getHistory({ page: 1, pageSize: 5 }),
      ]);
      setProfile(profileResult);
      setRecentHistory(historyResult.items);
    } catch {
      setError('Không thể tải hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session.getToken()) {
      router.replace('/login');
      return;
    }
    loadData();
  }, [loadData, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-error text-5xl">error_outline</span>
        <p className="text-on-surface-variant text-center">{error}</p>
        <button
          onClick={loadData}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity min-h-[44px]"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { user, stats, monthlyRank } = profile;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-widget-gap">
      {/* Header */}
      <section className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl">person</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{user.displayName}</h1>
            <p className="text-on-surface-variant font-body-sm text-body-sm">{user.email}</p>
            <p className="text-on-surface-variant font-label-caps text-label-caps mt-1">
              Tham gia từ {formatJoinDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-primary text-sm">military_tech</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {monthlyRank ? `Hạng #${monthlyRank.rank} tháng này` : 'Chưa có hạng tháng này'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-primary text-sm">stars</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {user.totalPoints} điểm dự đoán đúng (all-time)
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-widget-gap">
        <div className="lg:col-span-5">
          <ProfileStatsCard stats={stats} />
        </div>

        <div className="lg:col-span-7">
          <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-md text-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Lịch sử dự đoán gần đây
              </h3>
              <Link href="/history" className="text-primary font-label-caps text-label-caps hover:underline">
                Xem tất cả
              </Link>
            </div>
            <MatchHistoryList items={recentHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
