'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { session } from '@/lib/session';
import { validateDisplayName, validateEmail, validatePassword } from '@/lib/validation';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fieldError =
      validateEmail(email) ?? validateDisplayName(displayName) ?? validatePassword(password);
    if (fieldError) {
      setError(fieldError);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ email, displayName: displayName.trim(), password });
      session.save(res.token, res.user);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng ký thất bại, vui lòng thử lại.');
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
        id="displayName"
        label="Tên hiển thị"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <Field
        id="password"
        label="Mật khẩu (≥ 8 ký tự, gồm chữ và số)"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <SubmitButton loading={loading}>Đăng ký</SubmitButton>
      <p className="text-center text-sm text-ink-700">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-pitch-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
