import { TeamSide } from '@prisma/client';
import { z } from 'zod';

export const submitPredictionSchema = z.object({
  matchId: z.string().uuid('matchId phải là UUID hợp lệ'),
  criterionId: z.string().uuid('criterionId phải là UUID hợp lệ'),
  selectedTeam: z.nativeEnum(TeamSide, {
    errorMap: () => ({ message: 'selectedTeam phải là HOME hoặc AWAY' }),
  }),
});

export type SubmitPredictionInput = z.infer<typeof submitPredictionSchema>;
