import { apiFetch } from './client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED';
  totalPoints: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/**
 * AuthApiClient (UC01/UC02/UC15). Components call this, never fetch directly.
 */
export const authApi = {
  register(input: { email: string; displayName: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input });
  },
  login(input: { email: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input });
  },
  logout() {
    return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
  },
  me(token: string) {
    return apiFetch<{ user: AuthUser }>('/auth/me', { token });
  },
  forgotPassword(input: { email: string }) {
    return apiFetch<{ message: string }>('/auth/forgot-password', { method: 'POST', body: input });
  },
  resetPassword(input: { token: string; newPassword: string }) {
    return apiFetch<{ message: string }>('/auth/reset-password', { method: 'POST', body: input });
  },
};
