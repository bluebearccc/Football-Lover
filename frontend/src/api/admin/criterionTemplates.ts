import { adminFetch } from './client';
import type { CriterionTemplate } from './types';

export interface CriterionTemplateInput {
  name: string;
  description?: string;
}

export const adminCriterionTemplatesApi = {
  list() {
    return adminFetch<{ items: CriterionTemplate[] }>('/criterion-templates');
  },
  create(input: CriterionTemplateInput) {
    return adminFetch<CriterionTemplate>('/criterion-templates', { method: 'POST', body: input });
  },
  update(id: string, input: Partial<CriterionTemplateInput>) {
    return adminFetch<CriterionTemplate>(`/criterion-templates/${id}`, { method: 'PATCH', body: input });
  },
  remove(id: string) {
    return adminFetch<void>(`/criterion-templates/${id}`, { method: 'DELETE' });
  },
  deactivate(id: string) {
    return adminFetch<CriterionTemplate>(`/criterion-templates/${id}/deactivate`, { method: 'POST' });
  },
  reactivate(id: string) {
    return adminFetch<CriterionTemplate>(`/criterion-templates/${id}/reactivate`, { method: 'POST' });
  },
};
