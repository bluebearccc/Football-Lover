import { apiFetch, type RequestOptions } from '@/api/client';
import { session } from '@/lib/session';

/**
 * AdminApiClient base — injects the JWT from the session into every admin call.
 * Components must call the typed clients in `src/api/admin/*`, never fetch directly.
 */
export function adminFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = session.getToken() ?? undefined;
  return apiFetch<T>(`/admin${path}`, { ...options, token });
}
