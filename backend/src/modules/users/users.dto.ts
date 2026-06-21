import { Role, UserStatus } from '@prisma/client';
import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const setStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const setRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
