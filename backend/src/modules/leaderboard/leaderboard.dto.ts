import { z } from 'zod';

function currentMonth(): number {
  return new Date().getMonth() + 1;
}

function currentYear(): number {
  return new Date().getFullYear();
}

export const leaderboardQuerySchema = z.object({
  month: z.coerce
    .number()
    .int()
    .min(1, 'Tháng phải từ 1 đến 12')
    .max(12, 'Tháng phải từ 1 đến 12')
    .default(currentMonth),
  year: z.coerce
    .number()
    .int()
    .min(2000, 'Năm không hợp lệ')
    .max(2100, 'Năm không hợp lệ')
    .default(currentYear),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

export const leaderboardMeQuerySchema = z.object({
  month: z.coerce
    .number()
    .int()
    .min(1, 'Tháng phải từ 1 đến 12')
    .max(12, 'Tháng phải từ 1 đến 12')
    .default(currentMonth),
  year: z.coerce
    .number()
    .int()
    .min(2000, 'Năm không hợp lệ')
    .max(2100, 'Năm không hợp lệ')
    .default(currentYear),
});

export type LeaderboardMeQuery = z.infer<typeof leaderboardMeQuerySchema>;

export interface RankedEntry {
  rank: number;
  userId: string;
  displayName: string;
  winCount: number;
  totalPoints: number;
  accuracy: number | null;
  winStreak: number;
}

export interface LeaderboardPageResult {
  month: number;
  year: number;
  timezone: string;
  rankings: RankedEntry[];
  total: number;
  page: number;
  pageSize: number;
}
