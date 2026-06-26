'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { session } from '@/lib/session';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/users', label: 'User Manager', icon: 'group', exact: false },
  { href: '/admin/matches', label: 'Match Center', icon: 'sports_soccer', exact: false },
  { href: '/admin/teams', label: 'Teams', icon: 'shield', exact: false },
  { href: '/admin/matches', label: 'Point Rules', icon: 'rule', exact: false },
  { href: '/admin/comments', label: 'Comments', icon: 'chat', exact: false },
  { href: '/admin/logs', label: 'Activity Logs', icon: 'history', exact: false },
  { href: '/admin', label: 'Analytics', icon: 'analytics', exact: false },
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
      <div className="admin-layout flex h-screen overflow-hidden bg-surface text-on-surface">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col h-screen p-4 gap-4 bg-surface-container-low border-r border-outline-variant w-64 z-40 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                analytics
              </span>
            </div>
            <div>
              <h1 className="text-headline-md font-extrabold text-primary leading-none">GoalPredict</h1>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase font-bold">
                ADMIN PORTAL
              </p>
            </div>
          </div>

          {/* Admin profile card */}
          <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
            <div className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
                admin_panel_settings
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate text-on-surface">Admin Portal</p>
              <p className="text-xs text-on-surface-variant truncate">System Controller</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 mt-2 overflow-y-auto">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-primary-container text-on-primary-container font-bold translate-x-1'
                      : 'text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-label-caps">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* New Match CTA */}
          <Link
            href="/admin/matches"
            className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="text-label-caps">New Match</span>
          </Link>

          {/* Settings & Logout */}
          <div className="border-t border-outline-variant pt-3 flex flex-col gap-1">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/30 transition-colors rounded-lg w-full text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-label-caps font-label-caps">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex items-center justify-between px-gutter shrink-0 z-30">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-full pl-10 pr-4 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none placeholder:text-on-surface-variant/50"
                  placeholder="Tìm người dùng, trận đấu..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container-high flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: '18px' }}
                >
                  person
                </span>
              </div>
            </div>
          </header>

          {/* Scrollable page content */}
          <div className="flex-1 overflow-y-auto px-gutter py-6 bg-surface">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-surface-container-highest/90 backdrop-blur-lg border-t border-outline-variant">
          {NAV.slice(0, 4).map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  active ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-[10px] uppercase font-bold">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AdminGuard>
  );
}
