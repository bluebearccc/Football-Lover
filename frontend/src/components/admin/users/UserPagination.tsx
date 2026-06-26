'use client';

interface UserPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function UserPagination({ page, pageSize, total, onPageChange }: UserPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function getVisiblePages(): (number | '...')[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Hiển thị {from} đến {to} trong tổng số {total.toLocaleString('vi-VN')} người dùng
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant transition-colors disabled:opacity-30"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        {getVisiblePages().map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="text-on-surface-variant px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg font-bold text-sm transition-colors ${
                p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              {p.toLocaleString('vi-VN')}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant transition-colors disabled:opacity-30"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
