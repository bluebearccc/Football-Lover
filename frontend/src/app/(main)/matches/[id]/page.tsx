'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { MatchDetail } from '@/api/matches';
import { matchesApi } from '@/api/matches';
import { ApiError } from '@/api/client';
import { session } from '@/lib/session';
import TeamInfoPanel from '@/components/matches/TeamInfoPanel';
import CriteriaList from '@/components/matches/CriteriaList';
import StatsPanel from '@/components/matches/StatsPanel';
import CommentList from '@/components/matches/CommentList';
import PredictionsList from '@/components/matches/PredictionsList';

type Tab = 'overview' | 'stats' | 'predictions' | 'comments';

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  LIVE: { label: 'LIVE', className: 'bg-error-container/20 text-error' },
  SCHEDULED: { label: 'SẮP DIỄN RA', className: 'bg-secondary/10 text-secondary' },
  FINISHED: { label: 'KẾT THÚC', className: 'bg-on-surface-variant/10 text-on-surface-variant' },
  CANCELLED: { label: 'ĐÃ HỦY', className: 'bg-error/10 text-error' },
  POSTPONED: { label: 'HOÃN', className: 'bg-tertiary/10 text-tertiary' },
};

function formatMatchTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const isLoggedIn = typeof window !== 'undefined' && session.getToken() !== null;
  const canPredict = isLoggedIn && match?.status === 'SCHEDULED';

  const loadMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await matchesApi.getMatch(matchId);
      setMatch(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError('Không thể tải thông tin trận đấu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-on-surface-variant text-5xl">search_off</span>
        <p className="text-on-surface-variant font-body-lg">Không tìm thấy trận đấu</p>
        <Link
          href="/matches"
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity min-h-[44px]"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-error text-5xl">error_outline</span>
        <p className="text-on-surface-variant text-center">{error}</p>
        <button
          onClick={loadMatch}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity min-h-[44px]"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_DISPLAY[match.status] ?? STATUS_DISPLAY.SCHEDULED;
  const showScore = match.status === 'LIVE' || match.status === 'FINISHED';

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'stats', label: 'Thống kê' },
    {
      key: 'predictions',
      label: 'Dự đoán',
      badge: match.status === 'LIVE' ? 'Live' : undefined,
    },
    { key: 'comments', label: 'Bình luận' },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-widget-gap">
      {/* Scoreboard Header */}
      <section className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-8 relative overflow-hidden border border-outline-variant/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <TeamInfoPanel team={match.homeTeam} score={match.homeScore} side="home" />
          <div className="flex flex-col items-center gap-2">
            {showScore ? (
              <div className="flex items-center gap-6">
                <span className="font-display-lg text-on-surface tabular-nums">{match.homeScore ?? 0}</span>
                <div className="flex flex-col items-center">
                  <div className={`${statusInfo.className} px-3 py-1 rounded-full flex items-center gap-1 mb-2`}>
                    {match.status === 'LIVE' && (
                      <span className="w-2 h-2 bg-error rounded-full animate-pulse" />
                    )}
                    <span className="font-data-mono text-sm">{statusInfo.label}</span>
                  </div>
                  <span className="text-on-surface-variant font-bold text-2xl">:</span>
                </div>
                <span className="font-display-lg text-on-surface tabular-nums">{match.awayScore ?? 0}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className={`${statusInfo.className} px-3 py-1 rounded-full flex items-center gap-1`}>
                  <span className="font-data-mono text-sm">{statusInfo.label}</span>
                </div>
                <span className="font-headline-lg text-headline-lg text-on-surface-variant">VS</span>
              </div>
            )}
            <div className="text-on-surface-variant font-data-mono text-sm mt-2">
              {formatMatchTime(match.matchTime)}
            </div>
          </div>
          <TeamInfoPanel team={match.awayTeam} score={match.awayScore} side="away" />
        </div>

        {/* Gold Pool Info */}
        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-outline-variant/10">
          <div className="text-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant">GOLD POOL</span>
            <p className="font-data-mono text-data-mono text-primary">{match.goldPool}</p>
          </div>
          <div className="text-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant">ENTRY</span>
            <p className="font-data-mono text-data-mono text-on-surface">{match.entryGold}</p>
          </div>
          <div className="text-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant">NGƯỜI CHƠI</span>
            <p className="font-data-mono text-data-mono text-on-surface">{match.participantCount}</p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 md:gap-8 border-b border-outline-variant/20 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-widget-gap">
        <section className="lg:col-span-8 flex flex-col gap-widget-gap">
          {activeTab === 'overview' && (
            <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">checklist</span>
                Tiêu chí dự đoán
              </h3>
              <CriteriaList criteria={match.criteria} />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">query_stats</span>
                Thống kê dự đoán
              </h3>
              <StatsPanel criteria={match.criteria} statistics={match.statistics} />
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Dự đoán
              </h3>
              <PredictionsList
                predictions={match.predictions}
                criteria={match.criteria}
                matchStatus={match.status}
              />
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">chat</span>
                Bình luận ({match.comments.length})
              </h3>
              <CommentList comments={match.comments} />
            </div>
          )}
        </section>

        {/* Right sidebar — actions */}
        <aside className="lg:col-span-4 flex flex-col gap-widget-gap">
          {/* Prediction action area — only for authenticated users */}
          {isLoggedIn && match.status !== 'CANCELLED' && (
            <div className={`bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border ${
              canPredict ? 'border-primary/20 shadow-accent-glow' : 'border-outline-variant/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md text-headline-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Dự đoán
                </h3>
                {canPredict && (
                  <span className="bg-primary text-on-primary font-data-mono text-[10px] px-2 py-1 rounded-full animate-pulse">
                    MỞ
                  </span>
                )}
              </div>
              {canPredict ? (
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Chọn đội cho từng tiêu chí trước khi trận đấu bắt đầu.
                </p>
              ) : (
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  {match.status === 'LIVE' || match.status === 'FINISHED'
                    ? 'Dự đoán đã đóng cho trận đấu này.'
                    : 'Không thể dự đoán cho trận đấu này.'}
                </p>
              )}
            </div>
          )}

          {/* Guest CTA */}
          {!isLoggedIn && (
            <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
              <h3 className="font-headline-md text-headline-md mb-3">Tham gia dự đoán</h3>
              <p className="text-on-surface-variant font-body-sm text-body-sm mb-4">
                Đăng nhập để dự đoán và giành gold.
              </p>
              <Link
                href="/login"
                className="block w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-center hover:opacity-90 transition-opacity min-h-[44px]"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {/* Match info card */}
          <div className="bg-surface-container-low/70 backdrop-blur-sm rounded-xl p-card-padding border border-outline-variant/10">
            <h4 className="font-bold text-on-surface mb-3">Thông tin trận đấu</h4>
            <div className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Tiêu chí</span>
                <span className="text-on-surface">{match.criteria.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Người tham gia</span>
                <span className="text-on-surface">{match.participantCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Gold Pool</span>
                <span className="text-primary font-bold">{match.goldPool}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
