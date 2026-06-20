import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Đăng ký — Football-Lover' };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-ink-900">Tạo tài khoản</h1>
      <RegisterForm />
    </div>
  );
}
