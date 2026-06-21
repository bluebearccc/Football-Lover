import { session } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

/** Thin fetch wrapper. Components should call typed clients in `src/api/*`, not this directly. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : undefined;

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      const onAuthPage = AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));
      if (!onAuthPage) {
        session.clear();
        window.location.href = '/login';
      }
    }
    throw new ApiError(res.status, payload?.message ?? 'Có lỗi xảy ra', payload?.details);
  }

  return payload as T;
}
