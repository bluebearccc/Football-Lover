import { apiFetch } from './client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/**
 * AuthApiClient (UC01/UC02/UC15). Endpoints are stubs until the auth module
 * is implemented via `/implement-uc UC-01`. Components call this, never fetch directly.
 */
export const authApi = {
  register(input: { email: string; displayName: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input });
  },
  login(input: { email: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input });
  },
  forgotPassword(input: { email: string }) {
    return apiFetch<void>('/auth/forgot-password', { method: 'POST', body: input });
  },
  resetPassword(input: { token: string; newPassword: string }) {
    return apiFetch<void>('/auth/reset-password', { method: 'POST', body: input });
  },
};
