import { apiFetch } from './client';
import { session } from '@/lib/session';

export interface ConversationHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotMessageResponse {
  data: {
    response: string;
    conversationId: string | null;
    remainingMessages: number;
  };
}

export interface ChatbotStatusResponse {
  data: {
    remainingMessages: number;
    dailyLimit: number;
    resetAt: string;
  };
}

export const chatbotApi = {
  ask(message: string, conversationHistory: ConversationHistoryEntry[]): Promise<ChatbotMessageResponse> {
    const token = session.getToken();
    return apiFetch<ChatbotMessageResponse>('/chatbot/messages', {
      method: 'POST',
      body: { message, conversationHistory },
      token: token ?? undefined,
    });
  },

  getStatus(): Promise<ChatbotStatusResponse> {
    const token = session.getToken();
    return apiFetch<ChatbotStatusResponse>('/chatbot/status', {
      token: token ?? undefined,
    });
  },
};
