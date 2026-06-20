import { z } from 'zod';

// Password policy (BR02): >= 8 chars, must contain letters and digits.
const passwordPolicy = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Za-z]/, 'Mật khẩu phải gồm chữ và số')
  .regex(/\d/, 'Mật khẩu phải gồm chữ và số');

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  displayName: z.string().trim().min(2, 'Tên hiển thị tối thiểu 2 ký tự').max(50, 'Tên hiển thị tối đa 50 ký tự'),
  password: passwordPolicy,
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  newPassword: passwordPolicy,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
