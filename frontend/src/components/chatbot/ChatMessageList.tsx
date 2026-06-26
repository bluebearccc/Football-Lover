'use client';

import { useEffect, useRef } from 'react';
import type { ConversationHistoryEntry } from '@/api/chatbot';

interface ChatMessageListProps {
  messages: ConversationHistoryEntry[];
  isLoading?: boolean;
  error?: string | null;
}

export default function ChatMessageList({ messages, isLoading = false, error = null }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.length === 0 && !isLoading && !error && (
        <div className="text-center text-on-surface-variant/50 text-sm py-8">
          Hãy đặt câu hỏi về trận đấu, thống kê, hoặc dự đoán của bạn.
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-on-primary rounded-br-md'
                : 'bg-surface-container-highest text-on-surface rounded-bl-md'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {error && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-error-container text-on-error-container rounded-bl-md">
            {error}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-surface-container-highest rounded-2xl rounded-bl-md px-4 py-2">
            <div className="flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
