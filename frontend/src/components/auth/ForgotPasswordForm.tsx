'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validateEmail } from '@/lib/validation';
import { BrandHeader } from './BrandHeader';
import { Field } from './fields';
import { ValidationMessage } from './ValidationMessage';

const FORGOT_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1JbN0bOmyxyGFFgAkOCAcUf537AaDMNTxCLmS8Do2iPB3N-WUzmpC5cpXVKkoNE99Be-15FdlnFipAbNbnXI7Er4iZYfQdP37PyQs7ZYlm95ZQ9_pmG5b_0AnVrJsGd31yDBdAUsySbUrfS-ppj3NVvfKoFifvGfZHrWI1uFC7lGfyo9QFGY_AfNPN345y-N664qATfKm1rzjE52atIZ0mw7j7tI2vrbkSLe8Mt8FbzIqxFibgjyLHVBmJ4tKdM1YaFYTWtNe0A08';

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

  return (
    <>
      {/* Background — stadium image + gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Stadium Background"
          className="h-full w-full object-cover opacity-30"
          src={FORGOT_BG}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-surface/60" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] mx-auto">
        <BrandHeader subtitle="Khôi phục lợi thế cạnh tranh của bạn" />

        <div
          className="glass-card relative rounded-2xl p-8 transition-all duration-400"
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {sent ? (
            /* ── Trạng thái thành công ── */
            <div className="py-4 text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary accent-glow">
                  <span
                    className="material-symbols-outlined text-[48px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mark_email_read
                  </span>
                </div>
              </div>
              <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">
                Kiểm tra email của bạn
              </h2>
              <p className="mb-8 px-2 font-body-sm text-body-sm text-on-surface-variant">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến
                <br />
                <span className="mt-1 inline-block text-base font-semibold text-on-surface">
                  {email}
                </span>
                <br />
                <span className="mt-2 inline-block text-xs opacity-70">
                  Vui lòng kiểm tra hộp thư đến và thư mục spam.
                </span>
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => sendReset(email)}
                className="mb-4 w-full rounded-xl border border-outline-variant/50 bg-surface-container py-3.5 font-label-caps text-label-caps text-on-surface transition-all hover:bg-surface-container-highest active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Đang gửi…' : 'Gửi lại email'}
              </button>
              <div className="mt-6 border-t border-outline-variant/20 pt-6">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3.5 font-label-caps text-label-caps font-bold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            /* ── Trạng thái quên mật khẩu ── */
            <>
              <div className="mb-8 text-center">
                <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">
                  Quên mật khẩu?
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Nhập địa chỉ email liên kết với tài khoản của bạn, chúng tôi sẽ gửi liên kết
                  để đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label-caps text-label-caps tracking-widest text-on-primary shadow-lg shadow-primary/20 transition-all accent-glow hover:bg-primary-container active:scale-[0.98] disabled:opacity-60"
                  >
                    <span className="text-sm">
                      {loading ? 'ĐANG GỬI…' : 'GỬI LIÊN KẾT ĐẶT LẠI'}
                    </span>
                    {!loading && (
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    )}
                  </button>
                </div>
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
            </>
          )}
        </div>

        {/* Hỗ trợ */}
        <div className="mt-10 text-center opacity-80">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Cần thêm trợ giúp?{' '}
            <span className="cursor-pointer font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-fixed">
              Liên hệ hỗ trợ GoalPredict
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
