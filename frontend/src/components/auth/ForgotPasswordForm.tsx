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
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendReset(targetEmail: string) {
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: targetEmail });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    await sendReset(email);
  }

  if (sent) {
    return (
      <div className="py-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-primary accent-glow">
            <span
              className="material-symbols-outlined text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>
        <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">Kiểm tra email</h2>
        <p className="mb-8 px-4 font-body-sm text-body-sm text-on-surface-variant">
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.
          Vui lòng kiểm tra hộp thư và thư mục spam.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={() => sendReset(email)}
          className="w-full rounded-lg border border-primary py-3 font-label-caps text-label-caps text-primary transition-all hover:bg-primary/5 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Đang gửi…' : 'Gửi lại'}
        </button>
        <div className="mt-8 border-t border-outline-variant/10 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-body-sm text-body-sm text-primary transition-colors hover:text-primary-fixed"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">Quên mật khẩu?</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Nhập email tài khoản, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
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

        <SubmitButton loading={loading}>Gửi liên kết đặt lại</SubmitButton>
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
