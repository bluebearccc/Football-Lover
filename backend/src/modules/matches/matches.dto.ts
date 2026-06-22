import { TeamSide } from '@prisma/client';
import { z } from 'zod';

export const createMatchSchema = z
  .object({
    homeTeamId: z.string().uuid('Đội nhà không hợp lệ'),
    awayTeamId: z.string().uuid('Đội khách không hợp lệ'),
    matchTime: z.coerce.date({ errorMap: () => ({ message: 'Thời gian trận không hợp lệ' }) }),
    entryGold: z.coerce.number().min(0, 'entry_gold không được âm').optional(),
  })
  .refine((d) => d.homeTeamId !== d.awayTeamId, {
    message: 'Đội nhà và đội khách phải khác nhau',
    path: ['awayTeamId'],
  });

export const updateMatchSchema = z.object({
  homeTeamId: z.string().uuid().optional(),
  awayTeamId: z.string().uuid().optional(),
  matchTime: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  entryGold: z.coerce.number().min(0, 'entry_gold không được âm').optional(),
});

export const updateResultSchema = z.object({
  homeScore: z.coerce.number().int().min(0, 'Tỷ số không được âm'),
  awayScore: z.coerce.number().int().min(0, 'Tỷ số không được âm'),
});

export const setCriterionResultSchema = z.object({
  resultTeam: z.nativeEnum(TeamSide),
});

export const listMatchesQuerySchema = z.object({
  status: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const syncMatchesSchema = z.object({
  leagueId: z.number().int().positive('League ID phải là số dương'),
  season: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type UpdateResultInput = z.infer<typeof updateResultSchema>;
export type SetCriterionResultInput = z.infer<typeof setCriterionResultSchema>;
export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
