'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validateEmail } from '@/lib/validation';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setDone(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <ValidationMessage message={done} tone="success" />
        <Link href="/login" className="text-center text-sm font-medium text-pitch-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    );
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
      <SubmitButton loading={loading}>Gửi liên kết đặt lại</SubmitButton>
      <p className="text-center text-sm text-ink-700">
        <Link href="/login" className="font-medium text-pitch-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
