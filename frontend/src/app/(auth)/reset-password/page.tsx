import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = { title: 'Đặt lại mật khẩu — GoalPredict Live' };

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResetPasswordForm token={searchParams.token ?? ''} />;
}
