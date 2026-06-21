'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import { validateDisplayName, validateEmail, validatePassword } from '@/lib/validation';
import { Field, SubmitButton } from './fields';
import { ValidationMessage } from './ValidationMessage';
import { PasswordChecklist } from './PasswordChecklist';

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
      <div className="mb-6">
        <h2 className="mb-1 font-headline-md text-headline-md text-on-surface">Tạo tài khoản</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Tham gia dự đoán bóng đá cùng cộng đồng.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <ValidationMessage message={error} />

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

        <SubmitButton loading={loading}>Đăng ký</SubmitButton>
      </form>

      <div className="mt-8 border-t border-outline-variant/10 pt-6 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-primary transition-all hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant/50">
        Bằng việc đăng ký, bạn đồng ý với{' '}
        <span className="underline">Điều khoản sử dụng</span> và{' '}
        <span className="underline">Chính sách bảo mật</span>.
      </p>
    </>
  );
}
