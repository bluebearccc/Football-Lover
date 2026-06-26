import { adminFetch } from './client';
import type { DashboardOverview, Paginated, AdminLogEntry } from './types';
import { session } from '@/lib/session';

export interface DashboardParams {
  from?: string;
  to?: string;
  period?: '24h' | '7d';
}

function toQuery(params?: DashboardParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  if (params.from) sp.set('from', params.from);
  if (params.to) sp.set('to', params.to);
  if (params.period) sp.set('period', params.period);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const adminDashboardApi = {
  overview(params?: DashboardParams) {
    return adminFetch<DashboardOverview>(`/dashboard${toQuery(params)}`);
  },

  async exportCsv(params?: DashboardParams): Promise<void> {
    const token = session.getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
    const res = await fetch(`${baseUrl}/admin/dashboard/export${toQuery(params)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export interface AdminLogParams {
  page?: number;
  pageSize?: number;
  action?: string;
  from?: string;
  to?: string;
}

export const adminLogApi = {
  list(params?: AdminLogParams) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
    if (params?.action) sp.set('action', params.action);
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    const qs = sp.toString();
    return adminFetch<Paginated<AdminLogEntry>>(`/logs${qs ? `?${qs}` : ''}`);
  },
};
