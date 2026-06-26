import { Role, UserStatus } from '@prisma/client';
import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const setStatusSchema = z
  .object({
    status: z.nativeEnum(UserStatus),
    reason: z.string().trim().min(1).max(500).optional(),
  })
  .refine((data) => data.status !== UserStatus.LOCKED || (data.reason && data.reason.length > 0), {
    message: 'Lý do khoá tài khoản là bắt buộc',
    path: ['reason'],
  });

export const setRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const editUserSchema = z
  .object({
    displayName: z.string().trim().min(2).max(50).optional(),
    role: z.nativeEnum(Role).optional(),
  })
  .refine((data) => data.displayName !== undefined || data.role !== undefined, {
    message: 'Cần ít nhất một trường để cập nhật',
  });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
