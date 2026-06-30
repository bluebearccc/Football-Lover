import { adminFetch } from './client';
import type { Criterion, Match, MatchSyncResult, Paginated, ScoringSummary, TeamSide } from './types';

export interface MatchInput {
  homeTeamId: string;
  awayTeamId: string;
  matchTime: string;
  entryGold?: number;
  startDate?: string;
  endDate?: string;
}

export interface MatchDetail extends Match {
  criteria: Criterion[];
  participations: { id: string; userId: string; score: number; isWinner: boolean; goldWon: string }[];
}

export const adminMatchesApi = {
  list(params: { status?: string; sortOrder?: 'asc' | 'desc'; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.sortOrder) q.set('sortOrder', params.sortOrder);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return adminFetch<Paginated<Match>>(`/matches${qs ? `?${qs}` : ''}`);
  },
  get(id: string) {
    return adminFetch<MatchDetail>(`/matches/${id}`);
  },
  create(input: MatchInput) {
    return adminFetch<Match>('/matches', { method: 'POST', body: input });
  },
  update(id: string, input: Partial<MatchInput>) {
    return adminFetch<Match>(`/matches/${id}`, { method: 'PATCH', body: input });
  },
  updateResult(id: string, input: { homeScore: number; awayScore: number }) {
    return adminFetch<ScoringSummary>(`/matches/${id}/result`, { method: 'PUT', body: input });
  },
  setCriterionResult(criterionId: string, resultTeam: TeamSide) {
    return adminFetch<Criterion>(`/matches/criteria/${criterionId}/result`, {
      method: 'PUT',
      body: { resultTeam },
    });
  },
  cancel(id: string) {
    return adminFetch<{ message: string }>(`/matches/${id}/cancel`, { method: 'POST' });
  },
  remove(id: string) {
    return adminFetch<{ deleted: boolean }>(`/matches/${id}`, { method: 'DELETE' });
  },
  syncMatches(input: { leagueId: number; season?: number }) {
    return adminFetch<MatchSyncResult>('/sync/matches', { method: 'POST', body: input });
  },
};

export interface CriterionInput {
  name: string;
  description?: string;
}

export const adminCriteriaApi = {
  listByMatch(matchId: string) {
    return adminFetch<{ items: Criterion[] }>(`/criteria/match/${matchId}`);
  },
  create(matchId: string, input: CriterionInput) {
    return adminFetch<Criterion>(`/criteria/match/${matchId}`, { method: 'POST', body: input });
  },
  update(id: string, input: Partial<CriterionInput>) {
    return adminFetch<Criterion>(`/criteria/${id}`, { method: 'PATCH', body: input });
  },
  remove(id: string) {
    return adminFetch<void>(`/criteria/${id}`, { method: 'DELETE' });
  },
  deactivate(id: string) {
    return adminFetch<Criterion>(`/criteria/${id}/deactivate`, { method: 'POST' });
  },
  reactivate(id: string) {
    return adminFetch<Criterion>(`/criteria/${id}/reactivate`, { method: 'POST' });
  },
  applyDefaults(matchId: string) {
    return adminFetch<{ created: number }>(`/criteria/match/${matchId}/apply-defaults`, { method: 'POST' });
  },
};
