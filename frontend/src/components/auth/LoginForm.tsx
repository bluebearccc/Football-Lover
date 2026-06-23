'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { session } from '@/lib/session';
import { BrandHeader } from './BrandHeader';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';

const STADIUM_BG =
  'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=2000';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      session.save(res.token, res.user);
      router.push('/matches');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Background — stadium image + radial gradient overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(11,19,38,0.3) 0%, rgba(11,19,38,0.95) 100%), url('${STADIUM_BG}')`,
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <BrandHeader subtitle="Nâng tầm dự đoán bóng đá của bạn" />

        <div className="glass-card rounded-2xl p-8 sm:p-10">
          <form onSubmit={onSubmit} className="space-y-6">
            {justRegistered && (
              <ValidationMessage message="Đăng ký thành công! Vui lòng đăng nhập." tone="success" />
            )}
            <ValidationMessage message={error} />

            <Field
              id="email"
              label="Địa chỉ Email"
              icon="mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <Field
              id="password-login"
              label="Mật khẩu"
              icon="lock"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              labelRight={
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-label-caps text-primary transition-colors hover:text-primary-fixed"
                >
                  Quên mật khẩu?
                </Link>
              }
            />

            {/* Ghi nhớ đăng nhập */}
            <div className="flex items-center pt-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-outline-variant/50 bg-transparent text-primary transition-all focus:ring-primary/30 focus:ring-offset-0"
              />
              <label
                htmlFor="remember-me"
                className="ml-3 block cursor-pointer select-none font-body-sm text-body-sm text-on-surface-variant"
              >
                Duy trì đăng nhập trong 30 ngày
              </label>
            </div>

            <SubmitButton loading={loading}>Đăng nhập</SubmitButton>

            {/* Dải phân cách */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-4 flex-shrink-0 font-label-caps text-label-caps tracking-widest text-on-surface-variant/70">
                HOẶC TIẾP TỤC VỚI
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Đăng nhập mạng xã hội */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="glass-input group flex items-center justify-center gap-2 rounded-xl py-3 transition-colors hover:bg-white/5"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-body-sm text-body-sm font-semibold text-white">Google</span>
              </button>
              <button
                type="button"
                className="glass-input group flex items-center justify-center gap-2 rounded-xl py-3 transition-colors hover:bg-white/5"
              >
                <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-body-sm text-body-sm font-semibold text-white">Facebook</span>
              </button>
            </div>
          </form>
        </div>

        {/* Chân trang */}
        <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="ml-1 font-bold text-primary transition-all hover:text-primary-fixed hover:underline"
          >
            Tạo tài khoản
          </Link>
        </p>
      </div>
    </>
  );
}
