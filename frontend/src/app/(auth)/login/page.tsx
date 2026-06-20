import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Đăng nhập — Football-Lover' };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-ink-900">Đăng nhập</h1>
      <LoginForm />
    </div>
  );
}
