import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Quên mật khẩu — Football-Lover' };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Quên mật khẩu</h1>
        <p className="mt-1 text-sm text-ink-700">
          Nhập email tài khoản, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
