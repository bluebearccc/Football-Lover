'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { session } from '@/lib/session';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {justRegistered && (
        <ValidationMessage message="Đăng ký thành công! Vui lòng đăng nhập." tone="success" />
      )}
      <ValidationMessage message={error} />

      <Field
        id="email"
        label="Email"
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
            className="font-label-caps text-label-caps text-primary transition-all hover:underline"
          >
            Quên mật khẩu?
          </Link>
        }
      />

      <SubmitButton loading={loading}>Đăng nhập</SubmitButton>

      <div className="border-t border-outline-variant/10 pt-6 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-bold text-primary transition-all hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </form>
  );
}
