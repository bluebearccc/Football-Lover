import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  period: z.enum(['24h', '7d']).optional(),
});

export type DashboardQueryParams = z.infer<typeof dashboardQuerySchema>;
