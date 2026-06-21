'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { session } from '@/lib/session';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';

export function LoginForm() {
  const router = useRouter();
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ValidationMessage message={error} />
      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Field
        id="password"
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="-mt-1 text-right">
        <Link href="/forgot-password" className="text-sm text-pitch-600 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
      <SubmitButton loading={loading}>Đăng nhập</SubmitButton>
      <p className="text-center text-sm text-ink-700">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-medium text-pitch-600 hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
