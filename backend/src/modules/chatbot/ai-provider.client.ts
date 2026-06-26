import { ApiError } from '../../utils/ApiError';
import type { ConversationHistoryEntry } from './chatbot.dto';

interface AIProviderRequest {
  message: string;
  context: string;
  conversationHistory: ConversationHistoryEntry[];
  systemPrompt: string;
}

const TIMEOUT_MS = 5000;

const SYSTEM_PROMPT = [
  'Bạn là trợ lý chatbot chỉ đọc cho nền tảng GoalPredict Live.',
  'Bạn CHỈ được phép trả lời câu hỏi và cung cấp thông tin.',
  'Bạn KHÔNG ĐƯỢC thực hiện bất kỳ thay đổi dữ liệu nào.',
  'Nếu người dùng yêu cầu thay đổi, sửa, xóa, hoặc cập nhật dữ liệu, hãy từ chối lịch sự và giải thích rằng bạn chỉ có thể cung cấp thông tin.',
  'Trả lời bằng tiếng Việt.',
].join(' ');

export const aiProviderClient = {
  async send(
    message: string,
    context: string,
    conversationHistory: ConversationHistoryEntry[],
  ): Promise<string> {
    const proxyUrl = process.env.CHATBOT_PROXY_URL;
    const proxySecret = process.env.CHATBOT_PROXY_SECRET;

    if (!proxyUrl) {
      throw new ApiError(503, 'Chatbot tạm thời không khả dụng, vui lòng thử lại sau.');
    }

    const payload: AIProviderRequest = {
      message,
      context,
      conversationHistory,
      systemPrompt: SYSTEM_PROMPT,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (proxySecret) {
        headers['Authorization'] = `Bearer ${proxySecret}`;
      }

      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new ApiError(503, 'Chatbot tạm thời không khả dụng, vui lòng thử lại sau.');
      }

      const data = (await res.json()) as { response?: string };
      if (!data.response) {
        throw new ApiError(503, 'Chatbot tạm thời không khả dụng, vui lòng thử lại sau.');
      }

      return data.response;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(503, 'Chatbot tạm thời không khả dụng, vui lòng thử lại sau.');
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
