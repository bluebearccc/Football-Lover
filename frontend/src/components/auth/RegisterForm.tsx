'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validateDisplayName, validateEmail, validatePassword } from '@/lib/validation';
import { BrandHeader } from './BrandHeader';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';
import { PasswordChecklist } from './PasswordChecklist';

const REGISTER_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB1p9gb4RcH5D149QLDx3zwDfBupQDMCza5bhwHa6v-kRp3Yhx3n8ySqiZ3jJBKspH_kb5oh2hzZlVQUTy1EHCukAuLAA1PFrj5qSavrHUC-9AfMpkLLgEQr_v5U4b3WLMHLybqfQWwwwesiWE2-I_gXurnGODnyO4uTzsnyFgm_efx9VhuOgFCK2AEkpPta1iJVFseOTaFcHvbaMdr1KFtrQNdYSbK6-TPrSZQiC5yRh6-sPqop-oIXYAJh_D48UWH1PNSeQd9vkhz';

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
      await authApi.register({ email, displayName: displayName.trim(), password });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Background — gradient + stadium image (fixed) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(11,19,38,0.8), #0b1326), url('${REGISTER_BG}')`,
        }}
      />

      <div className="relative z-10 w-full py-12">
        <BrandHeader subtitle="Phân tích chính xác cho người hâm mộ hiện đại" />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 lg:flex-row">
          {/* Thống kê — Trái (desktop) */}
          <div className="hidden self-start pt-20 lg:flex lg:flex-col lg:gap-6">
            <div className="glass-panel flex items-center gap-4 rounded-xl p-4 transition-transform hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <span className="material-symbols-outlined text-primary">trending_up</span>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">ĐỘ CHÍNH XÁC</p>
                <p className="font-data-mono text-xl text-primary">94.2%</p>
              </div>
            </div>
          </div>

          {/* Thẻ đăng ký */}
          <div className="w-full max-w-md shrink-0">
            <div className="glass-panel relative overflow-hidden rounded-2xl p-8">
              {/* Gradient trang trí */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
                    Tạo tài khoản
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tham gia cùng 50k+ người dự đoán trên toàn thế giới.
                  </p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-label-caps text-label-caps text-primary/70">
                  Bước 1/1
                </span>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <ValidationMessage message={error} />

                {/* Thông tin tài khoản */}
                <div className="space-y-5 border-b border-white/5 pb-5">
                  <Field
                    id="displayName"
                    label="Tên hiển thị"
                    icon="person"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    required
                  />
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
                    id="password"
                    label="Mật khẩu"
                    icon="lock"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <PasswordChecklist password={password} />
                </div>

                <SubmitButton loading={loading} variant="gradient" icon="arrow_forward">
                  Tạo tài khoản
                </SubmitButton>
              </form>

              <div className="mt-8 border-t border-white/5 pt-6 text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Đã có tài khoản?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-primary transition-colors hover:text-primary-fixed"
                  >
                    Đăng nhập tại đây
                  </Link>
                </p>
              </div>
            </div>

            {/* Điều khoản */}
            <p className="mx-auto mt-6 max-w-xs text-center font-body-sm text-body-sm text-on-surface-variant/60 drop-shadow-md">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <span className="underline decoration-white/20">Điều khoản sử dụng</span> và{' '}
              <span className="underline decoration-white/20">Chính sách bảo mật</span>.
            </p>
          </div>

          {/* Thống kê — Phải (desktop) */}
          <div className="hidden self-end pb-20 lg:flex lg:flex-col lg:gap-6">
            <div className="glass-panel flex items-center gap-4 rounded-xl p-4 transition-transform hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                <span className="material-symbols-outlined text-secondary">groups</span>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">NGƯỜI DÙNG</p>
                <p className="font-data-mono text-xl text-secondary">52,804</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
