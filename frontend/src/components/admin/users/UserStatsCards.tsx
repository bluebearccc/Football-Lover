'use client';

import type { UserStats } from '@/api/admin/types';

interface UserStatsCardsProps {
  stats: UserStats | null;
}

const cards = [
  { key: 'totalUsers' as const, label: 'TỔNG NGƯỜI DÙNG', iconBg: 'bg-primary/10', iconColor: 'text-primary', icon: 'group', valueColor: 'text-primary' },
  { key: 'onlineNow' as const, label: 'ĐANG TRỰC TUYẾN', iconBg: 'bg-secondary/10', iconColor: 'text-secondary', icon: 'flash_on', valueColor: 'text-secondary' },
  { key: 'lockedUsers' as const, label: 'TÀI KHOẢN BỊ KHOÁ', iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary', icon: 'error', valueColor: 'text-tertiary' },
  { key: 'averageAccuracy' as const, label: 'ĐỘ CHÍNH XÁC TB', iconBg: 'bg-primary-container/10', iconColor: 'text-primary-container', icon: 'monitoring', valueColor: 'text-primary-container' },
] as const;

function formatValue(key: string, value: number): string {
  if (key === 'averageAccuracy') return `${value.toFixed(1)}%`;
  return value.toLocaleString('vi-VN');
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.key} className="glass-panel p-5 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 ${card.iconBg} rounded-lg`}>
              <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
            </div>
          </div>
          <p className="font-label-caps text-label-caps text-on-surface-variant">{card.label}</p>
          <h2 className={`font-headline-lg text-headline-lg-mobile ${card.valueColor}`}>
            {stats ? formatValue(card.key, stats[card.key]) : '—'}
          </h2>
        </div>
      ))}
    </div>
  );
}
