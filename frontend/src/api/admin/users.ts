import { adminFetch } from './client';
import type { AdminUser, Paginated, Role, UserStats, UserStatus } from './types';
import type { HistoryResponse, ProfileResponse } from '@/api/profile';

export const adminUsersApi = {
  list(params: { search?: string; role?: Role; status?: UserStatus; page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.role) q.set('role', params.role);
    if (params.status) q.set('status', params.status);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return adminFetch<Paginated<AdminUser>>(`/users${qs ? `?${qs}` : ''}`);
  },
  get(id: string) {
    return adminFetch<AdminUser>(`/users/${id}`);
  },
  setStatus(id: string, status: UserStatus, reason?: string) {
    return adminFetch<AdminUser>(`/users/${id}/status`, { method: 'PATCH', body: { status, reason } });
  },
  setRole(id: string, role: Role) {
    return adminFetch<AdminUser>(`/users/${id}/role`, { method: 'PATCH', body: { role } });
  },
  editUser(id: string, data: { displayName?: string; role?: Role }) {
    return adminFetch<AdminUser>(`/users/${id}`, { method: 'PATCH', body: data });
  },
  resetPassword(id: string) {
    return adminFetch<{ message: string }>(`/users/${id}/reset-password`, { method: 'POST' });
  },
  getStats() {
    return adminFetch<UserStats>('/users/stats');
  },
  getProfile(id: string) {
    return adminFetch<ProfileResponse>(`/users/${id}/profile`);
  },
  getHistory(id: string, params: { page?: number; pageSize?: number } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    const qs = q.toString();
    return adminFetch<HistoryResponse>(`/users/${id}/history${qs ? `?${qs}` : ''}`);
  },
};
