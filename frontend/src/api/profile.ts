import { apiFetch } from './client';
import { session } from '@/lib/session';
import type { MatchTeam } from './matches';

export interface ProfileUser {
  id: string;
  email: string;
  displayName: string;
  totalPoints: number;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface ProfileStats {
  totalMatches: number;
  totalWins: number;
  accuracy: number | null;
  totalGoldWon: string;
}

export interface ProfileMonthlyRank {
  rank: number;
  winCount: number;
  month: number;
  year: number;
}

export interface ProfileResponse {
  user: ProfileUser;
  stats: ProfileStats;
  monthlyRank: ProfileMonthlyRank | null;
}

export interface HistoryEntry {
  id: string;
  matchId: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  matchTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED';
  score: number;
  isWinner: boolean;
  goldWon: string;
}

export interface HistoryResponse {
  items: HistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export const profileApi = {
  getMe(): Promise<ProfileResponse> {
    const token = session.getToken();
    return apiFetch<ProfileResponse>('/profile/me', { token: token ?? undefined });
  },

  getHistory(params: { page?: number; pageSize?: number } = {}): Promise<HistoryResponse> {
    const token = session.getToken();
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    const qs = search.toString();
    return apiFetch<HistoryResponse>(`/profile/history${qs ? `?${qs}` : ''}`, {
      token: token ?? undefined,
    });
  },
};
