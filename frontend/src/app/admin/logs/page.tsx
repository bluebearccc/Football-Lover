'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminLogApi } from '@/api/admin/dashboard';
import type { AdminLogEntry, Paginated } from '@/api/admin/types';
import { ApiError } from '@/api/client';
import { formatDateTime } from '@/lib/format';
import { logStatusBadge } from '@/lib/admin-helpers';

const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'MATCH_CREATE', label: 'Tạo trận' },
  { value: 'MATCH_EDIT', label: 'Sửa trận' },
  { value: 'MATCH_SETTLE', label: 'Kết thúc trận' },
  { value: 'MATCH_CANCEL', label: 'Huỷ trận' },
  { value: 'CRITERIA_UPDATE', label: 'Cập nhật tiêu chí' },
  { value: 'USER_LOCK', label: 'Khoá tài khoản' },
  { value: 'USER_UNLOCK', label: 'Mở khoá tài khoản' },
  { value: 'USER_ROLE_CHANGE', label: 'Đổi vai trò' },
];

export default function AdminLogsPage() {
  const [data, setData] = useState<Paginated<AdminLogEntry> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const result = await adminLogApi.list({
        page,
        pageSize: 20,
        action: actionFilter || undefined,
      });
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không tải được nhật ký');
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-widget-gap">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Nhật ký hoạt động
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Theo dõi các thao tác quản trị và sự kiện hệ thống.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-container border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-1 focus:ring-primary py-2 px-3 outline-none"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-body-sm text-tertiary">
          {error}
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                  Thời gian
                </th>
                <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                  Loại
                </th>
                <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                  Mô tả
                </th>
                <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                  Người thực hiện
                </th>
                <th className="px-6 py-3 font-label-caps text-[10px] text-on-surface-variant whitespace-nowrap">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {data && data.items.length > 0 ? (
                data.items.map((log) => {
                  const badge = logStatusBadge(log.status);
                  return (
                    <tr key={log.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="px-6 py-4 text-data-mono text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-body-sm text-on-surface font-semibold">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant whitespace-nowrap">
                        {log.admin?.displayName ?? 'System'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-on-surface-variant text-body-sm"
                  >
                    {data ? 'Chưa có nhật ký nào.' : 'Đang tải...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-card-padding flex items-center justify-between border-t border-outline-variant/30">
            <span className="text-xs text-on-surface-variant">
              Trang {page}/{totalPages} • {data?.total ?? 0} kết quả
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg text-xs font-bold glass-card text-on-surface disabled:opacity-30"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg text-xs font-bold glass-card text-on-surface disabled:opacity-30"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
