'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validatePassword } from '@/lib/validation';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';
import { PasswordChecklist } from './PasswordChecklist';

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
    <>
      <div className="mb-6">
        <h2 className="mb-1 font-headline-md text-headline-md text-on-surface">Đặt lại mật khẩu</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <ValidationMessage message={error} />

        <Field
          id="newPassword"
          label="Mật khẩu mới"
          icon="lock"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <PasswordChecklist password={newPassword} />

        <Field
          id="confirm"
          label="Nhập lại mật khẩu"
          icon="lock"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
        />

        <SubmitButton loading={loading}>Đặt lại mật khẩu</SubmitButton>
      </form>

      <div className="mt-8 border-t border-outline-variant/10 pt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-body-sm text-body-sm text-primary transition-colors hover:text-primary-fixed"
        >
          <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
          Quay lại đăng nhập
        </Link>
      </div>
    </>
  );
}
