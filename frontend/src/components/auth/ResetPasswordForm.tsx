'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validatePassword } from '@/lib/validation';
import { BrandHeader } from './BrandHeader';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';
import { PasswordChecklist } from './PasswordChecklist';

const RESET_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1JbN0bOmyxyGFFgAkOCAcUf537AaDMNTxCLmS8Do2iPB3N-WUzmpC5cpXVKkoNE99Be-15FdlnFipAbNbnXI7Er4iZYfQdP37PyQs7ZYlm95ZQ9_pmG5b_0AnVrJsGd31yDBdAUsySbUrfS-ppj3NVvfKoFifvGfZHrWI1uFC7lGfyo9QFGY_AfNPN345y-N664qATfKm1rzjE52atIZ0mw7j7tI2vrbkSLe8Mt8FbzIqxFibgjyLHVBmJ4tKdM1YaFYTWtNe0A08';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Stadium Background" className="h-full w-full object-cover opacity-30" src={RESET_BG} />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-surface/60" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[480px]">
          <BrandHeader subtitle="Khôi phục lợi thế cạnh tranh của bạn" />
          <div className="glass-card rounded-2xl p-8">
            <ValidationMessage message="Liên kết không hợp lệ hoặc thiếu token." />
          </div>
        </div>
      </>
    );
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
      {/* Background — stadium image + gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Stadium Background"
          className="h-full w-full object-cover opacity-30"
          src={RESET_BG}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-surface/60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[480px]">
        <BrandHeader subtitle="Khôi phục lợi thế cạnh tranh của bạn" />

        <div className="glass-card rounded-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">
              Đặt lại mật khẩu
            </h2>
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

            <SubmitButton loading={loading} icon="arrow_forward">
              Đặt lại mật khẩu
            </SubmitButton>
          </form>

          <div className="mt-8 border-t border-outline-variant/20 pt-6">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container/50 py-3 font-label-caps text-label-caps font-bold text-on-surface transition-all hover:bg-surface-container active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
