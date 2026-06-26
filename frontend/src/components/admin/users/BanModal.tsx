'use client';

import { useState } from 'react';

interface BanModalProps {
  open: boolean;
  userName: string;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function BanModal({ open, userName, loading = false, onConfirm, onCancel }: BanModalProps) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  function handleConfirm() {
    const trimmed = reason.trim();
    if (trimmed.length > 0) {
      onConfirm(trimmed);
    }
  }

  function handleCancel() {
    setReason('');
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative glass-panel rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Khoá tài khoản</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
          Bạn có chắc chắn muốn khoá tài khoản <strong className="text-on-surface">{userName}</strong>?
        </p>
        <div className="mb-6">
          <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
            Lý do khoá <span className="text-tertiary">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
            rows={3}
            maxLength={500}
            placeholder="Nhập lý do khoá tài khoản…"
            className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/50 resize-none"
          />
          <p className="mt-1 text-xs text-on-surface-variant/50 text-right">{reason.length}/500</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || reason.trim().length === 0}
            className="px-6 py-2 rounded-xl font-bold bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Đang xử lý…' : 'Khoá tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}
