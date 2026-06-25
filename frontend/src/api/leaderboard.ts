import { apiFetch } from './client';
import { session } from '@/lib/session';

export interface RankedEntry {
  rank: number;
  userId: string;
  displayName: string;
  winCount: number;
  totalPoints: number;
  accuracy: number | null;
  winStreak: number;
}

export interface LeaderboardResponse {
  month: number;
  year: number;
  timezone: string;
  rankings: RankedEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LeaderboardQuery {
  month?: number;
  year?: number;
  page?: number;
  pageSize?: number;
}

export const leaderboardApi = {
  getLeaderboard(query: LeaderboardQuery = {}): Promise<LeaderboardResponse> {
    const params = new URLSearchParams();
    if (query.month) params.set('month', String(query.month));
    if (query.year) params.set('year', String(query.year));
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    const qs = params.toString();
    return apiFetch<LeaderboardResponse>(`/leaderboard${qs ? `?${qs}` : ''}`);
  },

  getMyRank(query: LeaderboardQuery = {}): Promise<RankedEntry | null> {
    const token = session.getToken();
    if (!token) return Promise.resolve(null);
    const params = new URLSearchParams();
    if (query.month) params.set('month', String(query.month));
    if (query.year) params.set('year', String(query.year));
    const qs = params.toString();
    return apiFetch<RankedEntry | null>(`/leaderboard/me${qs ? `?${qs}` : ''}`, { token });
  },
};
