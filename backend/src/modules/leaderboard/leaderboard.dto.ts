import { z } from 'zod';

const now = new Date();

export const leaderboardQuerySchema = z.object({
  month: z.coerce
    .number()
    .int()
    .min(1, 'Tháng phải từ 1 đến 12')
    .max(12, 'Tháng phải từ 1 đến 12')
    .default(now.getMonth() + 1),
  year: z.coerce
    .number()
    .int()
    .min(2000, 'Năm không hợp lệ')
    .max(2100, 'Năm không hợp lệ')
    .default(now.getFullYear()),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
