import { CriterionSource, TeamSide } from '@prisma/client';
import { z } from 'zod';

export const createCriterionSchema = z.object({
  name: z.string().trim().min(1, 'Tên tiêu chí không được để trống').max(120),
  description: z.string().trim().max(500).optional(),
  source: z.nativeEnum(CriterionSource).optional(),
});

export const updateCriterionSchema = createCriterionSchema.partial();

export const setCriterionResultSchema = z.object({
  resultTeam: z.nativeEnum(TeamSide),
});

export type CreateCriterionInput = z.infer<typeof createCriterionSchema>;
export type UpdateCriterionInput = z.infer<typeof updateCriterionSchema>;
export type SetCriterionResultInput = z.infer<typeof setCriterionResultSchema>;
