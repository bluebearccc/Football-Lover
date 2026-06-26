'use client';

import type { UserStatus } from '@/api/admin/types';

interface UserFiltersProps {
  statusFilter: UserStatus | null;
  onStatusChange: (status: UserStatus | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const TABS: { label: string; value: UserStatus | null }[] = [
  { label: 'Tất cả', value: null },
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Đã khoá', value: 'LOCKED' },
];

export function UserFilters({ statusFilter, onStatusChange, search, onSearchChange }: UserFiltersProps) {
  return (
    <div className="glass-panel rounded-t-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onStatusChange(tab.value)}
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'hover:bg-surface-variant text-on-surface-variant'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative w-full md:w-72">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên hoặc email…"
          className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/50"
        />
      </div>
    </div>
  );
}
