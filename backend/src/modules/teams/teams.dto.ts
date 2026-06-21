import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().trim().min(1, 'Tên đội không được để trống').max(100, 'Tên đội tối đa 100 ký tự'),
  shortName: z.string().trim().max(20, 'Tên viết tắt tối đa 20 ký tự').optional(),
  logoUrl: z.string().url('Logo URL không hợp lệ').optional(),
  externalId: z.string().trim().optional(),
});

export const updateTeamSchema = createTeamSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const listTeamsQuerySchema = z.object({
  search: z.string().trim().optional(),
  active: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const createPlayerSchema = z.object({
  name: z.string().trim().min(1, 'Tên cầu thủ không được để trống').max(100),
  position: z.string().trim().max(40).optional(),
  imageUrl: z.string().url('Ảnh cầu thủ không hợp lệ').optional(),
  externalId: z.string().trim().optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type ListTeamsQuery = z.infer<typeof listTeamsQuerySchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
