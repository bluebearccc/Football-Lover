import { ApiError } from '../../utils/ApiError';
import { aiProviderClient } from './ai-provider.client';
import { chatbotRepository } from './chatbot.repository';
import type { ConversationHistoryEntry } from './chatbot.dto';
import { userContextService } from './user-context.service';

const DAILY_LIMIT = 20;
const HCM_OFFSET_MS = 7 * 60 * 60_000;

const WRITE_KEYWORDS = [
  'thay đổi', 'sửa', 'xóa', 'cập nhật', 'chỉnh sửa', 'tạo mới',
  'thêm', 'bớt', 'hủy', 'đặt lại', 'reset',
  'delete', 'remove', 'update', 'modify', 'change', 'create', 'add', 'cancel',
];

function getTodayStartHCM(): Date {
  const now = new Date();
  const hcmOffset = 7 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const hcmMs = utcMs + hcmOffset * 60_000;
  const hcmDate = new Date(hcmMs);
  hcmDate.setHours(0, 0, 0, 0);
  const todayStartUtcMs = hcmDate.getTime() - hcmOffset * 60_000;
  return new Date(todayStartUtcMs);
}

function getNextMidnightHCM(): string {
  const todayStart = getTodayStartHCM();
  const nextMidnightUtc = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const hcmTime = new Date(nextMidnightUtc.getTime() + HCM_OFFSET_MS);
  const iso = hcmTime.toISOString().replace('Z', '');
  return `${iso}+07:00`;
}

export const chatbotService = {
  isReadOnly(message: string): boolean {
    const lower = message.toLowerCase();
    return !WRITE_KEYWORDS.some((kw) => lower.includes(kw));
  },

  async answer(
    userId: string,
    message: string,
    conversationHistory: ConversationHistoryEntry[],
  ): Promise<{ response: string; conversationId: string | null; remainingMessages: number }> {
    if (!this.isReadOnly(message)) {
      throw ApiError.badRequest(
        'Chatbot chỉ có thể cung cấp thông tin, không thể thay đổi dữ liệu. Vui lòng đặt câu hỏi tra cứu.',
        { code: 'READ_ONLY_VIOLATION' },
      );
    }

    const todayStart = getTodayStartHCM();
    const usedToday = await chatbotRepository.countTodayByUser(userId, todayStart);

    if (usedToday >= DAILY_LIMIT) {
      throw ApiError.tooManyRequests(
        `Bạn đã hết lượt hỏi chatbot hôm nay (${DAILY_LIMIT}/${DAILY_LIMIT}). Vui lòng thử lại vào ngày mai.`,
        { code: 'RATE_LIMIT_EXCEEDED' },
      );
    }

    const context = await userContextService.buildSafeContext(userId);
    const aiResponse = await aiProviderClient.send(message, context, conversationHistory);

    const conversationId = await chatbotRepository.save(userId, message, aiResponse);

    const remaining = DAILY_LIMIT - usedToday - 1;
    return { response: aiResponse, conversationId, remainingMessages: remaining };
  },

  async getStatus(userId: string): Promise<{ remainingMessages: number; dailyLimit: number; resetAt: string }> {
    const todayStart = getTodayStartHCM();
    const usedToday = await chatbotRepository.countTodayByUser(userId, todayStart);
    return {
      remainingMessages: Math.max(0, DAILY_LIMIT - usedToday),
      dailyLimit: DAILY_LIMIT,
      resetAt: getNextMidnightHCM(),
    };
  },
};
