'use client';

import { useState, useCallback, useEffect } from 'react';
import { session } from '@/lib/session';
import { chatbotApi } from '@/api/chatbot';
import type { ConversationHistoryEntry } from '@/api/chatbot';
import { ApiError } from '@/api/client';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

const ERROR_MESSAGES: Record<string, string> = {
  PROVIDER_UNAVAILABLE: 'Chatbot tạm thời không khả dụng, vui lòng thử lại sau.',
  RATE_LIMIT_EXCEEDED: 'Bạn đã hết lượt hỏi chatbot hôm nay. Vui lòng thử lại vào ngày mai.',
  VALIDATION_ERROR: 'Tin nhắn không hợp lệ. Vui lòng kiểm tra lại.',
  READ_ONLY_VIOLATION: 'Chatbot chỉ có thể cung cấp thông tin, không thể thay đổi dữ liệu.',
};

function mapErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const details = err.details as { code?: string } | undefined;
    if (details?.code && ERROR_MESSAGES[details.code]) {
      return ERROR_MESSAGES[details.code];
    }
    if (err.status === 429) return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    if (err.status === 503) return ERROR_MESSAGES.PROVIDER_UNAVAILABLE;
    return err.message || 'Có lỗi xảy ra, vui lòng thử lại.';
  }
  return 'Có lỗi xảy ra, vui lòng thử lại.';
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const user = session.getUser();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      chatbotApi
        .getStatus()
        .then((res) => setRemaining(res.data.remainingMessages))
        .catch(() => {});
    }
  }, [isOpen, isAuthenticated]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setMessages([]);
        setError(null);
        setRemaining(null);
      }
      return !prev;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleToggle();
      }
    },
    [isOpen, handleToggle],
  );

  const handleSend = useCallback(
    async (message: string) => {
      setError(null);

      const userMsg: ConversationHistoryEntry = { role: 'user', content: message };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const history = messages.slice(-18);
        const res = await chatbotApi.ask(message, history);
        const assistantMsg: ConversationHistoryEntry = { role: 'assistant', content: res.data.response };
        setMessages((prev) => [...prev, assistantMsg]);
        setRemaining(res.data.remainingMessages);
      } catch (err) {
        setError(mapErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  return (
    <div onKeyDown={handleKeyDown} role="complementary" aria-label="Chatbot">
      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[60] min-w-[56px] min-h-[56px] rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
        type="button"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'chat'}
        </span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-[60] w-[calc(100vw-2rem)] max-w-[380px] h-[480px] md:h-[520px] rounded-2xl bg-surface border border-outline-variant/20 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
              <span className="font-semibold text-sm text-on-surface">Chatbot</span>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && remaining !== null && (
                <span className="text-xs text-on-surface-variant">
                  {remaining}/20
                </span>
              )}
              <button
                onClick={handleToggle}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Đóng chatbot"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Body */}
          {isAuthenticated ? (
            <>
              <ChatMessageList messages={messages} isLoading={isLoading} error={error} />
              <ChatInput
                onSend={handleSend}
                disabled={isLoading || remaining === 0}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">lock</span>
              <p className="text-on-surface-variant text-sm mb-4">
                Vui lòng đăng nhập để sử dụng chatbot.
              </p>
              <a
                href="/login"
                className="inline-flex items-center px-6 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity min-h-[44px]"
              >
                Đăng nhập
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
