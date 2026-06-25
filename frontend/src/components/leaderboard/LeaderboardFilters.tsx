'use client';

const TABS = [
  { key: 'global', label: 'Global', enabled: true },
  { key: 'friends', label: 'Friends', enabled: false },
  { key: 'weekly', label: 'Weekly', enabled: false },
  { key: 'all-time', label: 'All-Time', enabled: false },
] as const;

export default function LeaderboardFilters() {
  return (
    <div className="flex bg-surface-container-high p-1 rounded-xl border border-outline-variant/10 overflow-x-auto w-full md:w-auto">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          disabled={!tab.enabled}
          className={`px-6 py-2 rounded-lg whitespace-nowrap transition-colors min-h-[44px] ${
            tab.enabled
              ? 'text-primary bg-primary-container/10 font-bold'
              : 'text-on-surface-variant/50 cursor-not-allowed'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
