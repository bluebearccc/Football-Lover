'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { session } from '@/lib/session';

const NAV = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/teams', label: 'Đội bóng' },
  { href: '/admin/matches', label: 'Trận đấu' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/comments', label: 'Bình luận' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    session.clear();
    router.replace('/login');
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-ink-50 text-ink-900">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-100 bg-white p-4 sm:flex">
          <Link href="/" className="mb-6 px-2 text-lg font-bold">
            GoalPredict <span className="text-pitch-500">Admin</span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? 'bg-pitch-100 text-pitch-700' : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button onClick={logout} className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50">
            Đăng xuất
          </button>
        </aside>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
