'use client';

interface MatchFilterBarProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

const STATUSES = [
  { value: '', label: 'ALL' },
  { value: 'LIVE', label: 'LIVE' },
  { value: 'SCHEDULED', label: 'UPCOMING' },
  { value: 'FINISHED', label: 'FINISHED' },
];

export default function MatchFilterBar({
  activeStatus,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: MatchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Status tabs */}
      <div
        className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10"
        role="tablist"
        aria-label="Lọc trận đấu theo trạng thái"
      >
        {STATUSES.map((s) => {
          const active = activeStatus === s.value;
          return (
            <button
              key={s.value}
              role="tab"
              aria-selected={active}
              onClick={() => onStatusChange(s.value)}
              className={`px-6 py-2 rounded-lg font-label-caps text-label-caps transition-colors min-h-[44px] ${
                active
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="Từ ngày"
          className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-1 focus:ring-primary focus:outline-none min-h-[44px]"
        />
        <span className="text-on-surface-variant font-label-caps text-label-caps">—</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Đến ngày"
          className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-1 focus:ring-primary focus:outline-none min-h-[44px]"
        />
      </div>
    </div>
  );
}
