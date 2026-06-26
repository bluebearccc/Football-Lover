'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import NotificationBell from '@/components/notifications/NotificationBell';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  filledIcon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/matches', label: 'Live', icon: 'sensors', filledIcon: 'sensors' },
  { href: '/predictions', label: 'Predict', icon: 'insights' },
  { href: '/leaderboard', label: 'Rank', icon: 'emoji_events' },
  { href: '/profile', label: 'Me', icon: 'account_circle' },
];

const SIDE_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/matches', label: 'Live Matches', icon: 'live_tv' },
  { href: '/predictions', label: 'Predictions', icon: 'query_stats' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { href: '/profile', label: 'My Profile', icon: 'person' },
  { href: '/history', label: 'Match History', icon: 'history' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-surface text-on-surface font-body-lg antialiased min-h-screen">
      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/20 z-50 bg-surface py-6">
        <div className="px-6 mb-10">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            GoalPredict Live
          </Link>
        </div>
        <div className="flex-1 space-y-1">
          {SIDE_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 transition-colors ${
                  active
                    ? 'text-primary bg-primary-container/10 border-r-4 border-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined mr-3">{item.icon}</span>
                <span className="font-body-lg text-body-lg">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Top AppBar */}
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center h-16 md:pl-64 px-4 md:px-8">
        <div className="flex items-center space-x-4">
          <span className="md:hidden font-headline-md text-headline-md font-extrabold text-primary">
            GoalPredict
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:pl-64 pt-20 pb-24 md:pb-8 min-h-screen px-4 md:px-8">
        {children}
      </main>

      {/* Mobile Bottom NavBar */}
      <footer className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container border-t border-outline-variant/20 shadow-lg flex justify-around items-center h-16 px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center min-w-[44px] min-h-[44px] justify-center ${
                active ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active && item.filledIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label-caps text-label-caps">{item.label}</span>
            </Link>
          );
        })}
      </footer>
    </div>
  );
}
