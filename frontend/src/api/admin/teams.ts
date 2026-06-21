import { adminFetch } from './client';
import type { Paginated, Player, Team, TeamWithPlayers } from './types';

export interface TeamInput {
  name: string;
  shortName?: string;
  logoUrl?: string;
  externalId?: string;
  isActive?: boolean;
}

export interface PlayerInput {
  name: string;
  position?: string;
  imageUrl?: string;
  externalId?: string;
}

export const adminTeamsApi = {
  list(params: { search?: string; active?: 'true' | 'false'; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.active) q.set('active', params.active);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return adminFetch<Paginated<Team>>(`/teams${qs ? `?${qs}` : ''}`);
  },
  get(id: string) {
    return adminFetch<TeamWithPlayers>(`/teams/${id}`);
  },
  create(input: TeamInput) {
    return adminFetch<Team>('/teams', { method: 'POST', body: input });
  },
  update(id: string, input: Partial<TeamInput>) {
    return adminFetch<Team>(`/teams/${id}`, { method: 'PATCH', body: input });
  },
  remove(id: string) {
    return adminFetch<{ deleted: boolean; team?: Team }>(`/teams/${id}`, { method: 'DELETE' });
  },
  addPlayer(teamId: string, input: PlayerInput) {
    return adminFetch<Player>(`/teams/${teamId}/players`, { method: 'POST', body: input });
  },
  updatePlayer(teamId: string, playerId: string, input: Partial<PlayerInput>) {
    return adminFetch<Player>(`/teams/${teamId}/players/${playerId}`, {
      method: 'PATCH',
      body: input,
    });
  },
  removePlayer(teamId: string, playerId: string) {
    return adminFetch<void>(`/teams/${teamId}/players/${playerId}`, { method: 'DELETE' });
  },
};
