import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = { title: 'Đặt lại mật khẩu — Football-Lover' };

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-ink-900">Đặt lại mật khẩu</h1>
      <ResetPasswordForm token={searchParams.token ?? ''} />
    </div>
  );
}
