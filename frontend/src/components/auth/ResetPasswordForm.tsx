'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validatePassword } from '@/lib/validation';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <ValidationMessage message="Liên kết không hợp lệ hoặc thiếu token." />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const pwError = validatePassword(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (newPassword !== confirm) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      router.push('/login');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Đặt lại mật khẩu thất bại, vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ValidationMessage message={error} />
      <Field
        id="newPassword"
        label="Mật khẩu mới (≥ 8 ký tự, gồm chữ và số)"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <Field
        id="confirm"
        label="Nhập lại mật khẩu"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <SubmitButton loading={loading}>Đặt lại mật khẩu</SubmitButton>
      <p className="text-center text-sm text-ink-700">
        <Link href="/login" className="font-medium text-pitch-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
