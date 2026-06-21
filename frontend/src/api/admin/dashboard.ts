import { adminFetch } from './client';
import type { DashboardOverview } from './types';

export const adminDashboardApi = {
  overview() {
    return adminFetch<DashboardOverview>('/dashboard');
  },
};
