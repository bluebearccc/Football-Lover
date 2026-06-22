'use client';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Phân trang">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest font-data-mono text-data-mono transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="text-on-surface-variant px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg font-data-mono text-data-mono transition-colors ${
            p === page
              ? 'bg-primary text-on-primary font-bold'
              : 'border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-on-surface-variant px-1">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest font-data-mono text-data-mono transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </nav>
  );
}
