'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 500;

export default function ChatInput({ onSend, disabled = false, maxLength = DEFAULT_MAX_LENGTH }: ChatInputProps) {
  const [value, setValue] = useState('');

  const trimmed = value.trim();
  const isOverLimit = value.length > maxLength;
  const canSend = trimmed.length > 0 && !isOverLimit && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(trimmed);
    setValue('');
  }, [canSend, trimmed, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="border-t border-outline-variant/20 p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg bg-surface-container-highest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          aria-label="Nhập câu hỏi cho chatbot"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-primary text-on-primary disabled:opacity-40 transition-opacity"
          aria-label="Gửi tin nhắn"
          type="button"
        >
          <span className="material-symbols-outlined text-xl">send</span>
        </button>
      </div>
      <div className={`text-right text-xs mt-1 ${isOverLimit ? 'text-error' : 'text-on-surface-variant/60'}`}>
        {value.length}/{maxLength}
      </div>
    </div>
  );
}
