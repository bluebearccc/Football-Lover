'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { session } from '@/lib/session';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (session.getToken()) {
      const user = session.getUser();
      router.replace(user?.role === 'ADMIN' ? '/admin' : '/matches');
    }
  }, [router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface p-gutter text-on-surface">
      {children}
    </main>
  );
}
