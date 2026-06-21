// Vietnamese formatting helpers (timezone Asia/Ho_Chi_Minh, gold to 2 decimals).

const TZ = 'Asia/Ho_Chi_Minh';

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Convert an ISO instant to the value an <input type="datetime-local"> expects. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatGold(value: string | number): string {
  const n = typeof value === 'number' ? value : Number(value);
  return n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_VI: Record<string, string> = {
  SCHEDULED: 'Chưa diễn ra',
  LIVE: 'Đang diễn ra',
  FINISHED: 'Đã kết thúc',
  CANCELLED: 'Đã huỷ',
  POSTPONED: 'Hoãn',
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đã khoá',
  VISIBLE: 'Hiển thị',
  HIDDEN: 'Đã ẩn',
  DELETED: 'Đã xoá',
};

export function statusLabel(status: string): string {
  return STATUS_VI[status] ?? status;
}

export const DEFAULT_TEAM_LOGO = '/default-team.svg';
export const DEFAULT_PLAYER_IMAGE = '/default-player.svg';
