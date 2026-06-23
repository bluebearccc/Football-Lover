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

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Bình luận không được để trống')
    .max(1000, 'Bình luận không được vượt quá 1000 ký tự'),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
export type SetCommentStatusInput = z.infer<typeof setCommentStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
