import { z } from 'zod';

const conversationHistoryEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Nội dung tin nhắn không được để trống'),
});

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Tin nhắn không được để trống')
    .max(500, 'Tin nhắn không được vượt quá 500 ký tự'),
  conversationHistory: z
    .array(conversationHistoryEntrySchema)
    .max(20, 'Lịch sử hội thoại không được vượt quá 20 tin nhắn')
    .optional()
    .default([]),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationHistoryEntry = z.infer<typeof conversationHistoryEntrySchema>;
