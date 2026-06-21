import { CommentStatus } from '@prisma/client';
import { z } from 'zod';

export const listCommentsQuerySchema = z.object({
  matchId: z.string().uuid().optional(),
  status: z.nativeEnum(CommentStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const setCommentStatusSchema = z.object({
  status: z.nativeEnum(CommentStatus),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
export type SetCommentStatusInput = z.infer<typeof setCommentStatusSchema>;
