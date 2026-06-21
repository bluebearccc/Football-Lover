'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { session } from '@/lib/session';

/**
 * Client-side RBAC guard for the admin area. Redirects non-admins to login.
 * The backend independently enforces ADMIN on every endpoint (defense in depth).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = session.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-700">
        Đang kiểm tra quyền truy cập…
      </div>
    );
  }

  return <>{children}</>;
}
