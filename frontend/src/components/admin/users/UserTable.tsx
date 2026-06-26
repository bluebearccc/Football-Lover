'use client';

import type { AdminUser } from '@/api/admin/types';
import { formatDateTime } from '@/lib/format';

interface UserTableProps {
  users: AdminUser[];
  onBan: (user: AdminUser) => void;
  onUnban: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserTable({ users, onBan, onUnban, onEdit, onResetPassword }: UserTableProps) {
  return (
    <div className="glass-panel rounded-b-xl overflow-x-auto border-t-0">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/20">
            <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Tên / ID</th>
            <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Trạng thái</th>
            <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Điểm</th>
            <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Độ chính xác</th>
            <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase">Ngày tham gia</th>
            <th className="p-5 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-surface-container-highest/50 transition-all duration-200 hover:translate-x-1"
            >
              <td className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    {getInitials(user.displayName)}
                  </div>
                  <div>
                    <p className="font-body-lg text-body-lg text-on-surface font-semibold">{user.displayName}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant/60">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-5">
                {user.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                    Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">
                    Khoá
                  </span>
                )}
              </td>
              <td className="p-5 font-data-mono text-data-mono text-primary">
                {user.totalPoints.toLocaleString('vi-VN')} pts
              </td>
              <td className="p-5">
                <div className="w-24 bg-surface-variant h-1.5 rounded-full">
                  <div
                    className={`h-full rounded-full ${user.status === 'ACTIVE' ? 'bg-primary' : 'bg-tertiary'}`}
                    style={{ width: `${Math.min(user.accuracy ?? 0, 100)}%` }}
                  />
                </div>
                <span className="font-data-mono text-xs mt-1 block">
                  {user.accuracy != null ? `${user.accuracy}%` : '—'}
                </span>
              </td>
              <td className="p-5 font-body-sm text-body-sm text-on-surface-variant">
                {formatDateTime(user.createdAt)}
              </td>
              <td className="p-5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                    title="Sửa"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button
                    onClick={() => onResetPassword(user)}
                    className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-secondary"
                    title="Đặt lại mật khẩu"
                  >
                    <span className="material-symbols-outlined text-xl">lock_reset</span>
                  </button>
                  {user.status === 'ACTIVE' ? (
                    user.role !== 'ADMIN' && (
                      <button
                        onClick={() => onBan(user)}
                        className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-tertiary"
                        title="Khoá tài khoản"
                      >
                        <span className="material-symbols-outlined text-xl">block</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onUnban(user)}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-primary"
                      title="Mở khoá"
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                Không có người dùng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
