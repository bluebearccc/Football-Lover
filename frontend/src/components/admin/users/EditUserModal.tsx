'use client';

import { useEffect, useState } from 'react';
import type { AdminUser, Role } from '@/api/admin/types';

interface EditUserModalProps {
  open: boolean;
  user: AdminUser | null;
  currentAdminId: string | null;
  loading?: boolean;
  onSave: (data: { displayName?: string; role?: Role }) => void;
  onCancel: () => void;
}

export function EditUserModal({ open, user, currentAdminId, loading = false, onSave, onCancel }: EditUserModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('USER');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setRole(user.role);
    }
  }, [user]);

  if (!open || !user) return null;

  const isSelf = user.id === currentAdminId;
  const hasChanges = displayName.trim() !== user.displayName || role !== user.role;
  const nameValid = displayName.trim().length >= 2 && displayName.trim().length <= 50;

  function handleSave() {
    if (!user) return;
    const data: { displayName?: string; role?: Role } = {};
    if (displayName.trim() !== user.displayName) data.displayName = displayName.trim();
    if (role !== user.role) data.role = role;
    if (Object.keys(data).length > 0) onSave(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-panel rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Chỉnh sửa người dùng</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Tên hiển thị</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-body-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {displayName.trim().length > 0 && !nameValid && (
              <p className="mt-1 text-xs text-tertiary">Tên phải từ 2 đến 50 ký tự</p>
            )}
          </div>

          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Vai trò
              {isSelf && <span className="text-on-surface-variant/50 normal-case ml-2">(không thể tự hạ quyền)</span>}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isSelf}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-body-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges || !nameValid}
            className="px-6 py-2 rounded-xl font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
