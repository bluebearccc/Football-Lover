import { z } from 'zod';

export const listPublicMatchesQuerySchema = z.object({
  status: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPublicMatchesQuery = z.infer<typeof listPublicMatchesQuerySchema>;
