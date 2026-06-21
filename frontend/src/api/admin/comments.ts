import { adminFetch } from './client';
import type { AdminComment, CommentStatus, Paginated } from './types';

export const adminCommentsApi = {
  list(params: { matchId?: string; status?: CommentStatus; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.matchId) q.set('matchId', params.matchId);
    if (params.status) q.set('status', params.status);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return adminFetch<Paginated<AdminComment>>(`/comments${qs ? `?${qs}` : ''}`);
  },
  setStatus(id: string, status: CommentStatus) {
    return adminFetch<AdminComment>(`/comments/${id}/status`, { method: 'PATCH', body: { status } });
  },
};
