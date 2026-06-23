import { apiFetch } from './client';
import { session } from '@/lib/session';

export interface MatchTeam {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
}

export interface MatchListItem {
  id: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  matchTime: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED';
  homeScore: number | null;
  awayScore: number | null;
  entryGold: string;
  participantCount: number;
  criteriaCount: number;
}

export interface MatchListResponse {
  items: MatchListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MatchCriterion {
  id: string;
  name: string;
  description: string | null;
  resultTeam: 'HOME' | 'AWAY' | null;
}

export interface MatchStatistic {
  criterionId: string;
  totalHomeVotes: number;
  totalAwayVotes: number;
}

export interface MatchComment {
  id: string;
  user: { id: string; displayName: string };
  content: string;
  createdAt: string;
}

export interface MatchPrediction {
  id: string;
  user: { id: string; displayName: string };
  criterionId: string;
  selectedTeam: 'HOME' | 'AWAY';
  isCorrect: boolean | null;
}

export interface MatchDetail {
  id: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  matchTime: string;
  startDate: string | null;
  endDate: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED';
  homeScore: number | null;
  awayScore: number | null;
  entryGold: string;
  participantCount: number;
  goldPool: string;
  criteria: MatchCriterion[];
  statistics: MatchStatistic[];
  comments: MatchComment[];
  predictions: MatchPrediction[];
}

export interface MatchListFilters {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const matchesApi = {
  listMatches(filters: MatchListFilters = {}): Promise<MatchListResponse> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    const qs = params.toString();
    return apiFetch<MatchListResponse>(`/matches${qs ? `?${qs}` : ''}`);
  },

  getMatch(id: string): Promise<MatchDetail> {
    const token = session.getToken();
    return apiFetch<MatchDetail>(`/matches/${id}`, token ? { token } : {});
  },

  createComment(matchId: string, content: string): Promise<MatchComment> {
    const token = session.getToken();
    return apiFetch<MatchComment>(`/matches/${matchId}/comments`, {
      method: 'POST',
      body: { content },
      token: token ?? undefined,
    });
  },
};
