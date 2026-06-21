import { Role, UserStatus, type User } from '@prisma/client';
import { env } from '../../config/env';
import { mailer } from '../../lib/mailer';
import { ApiError } from '../../utils/ApiError';
import { signAccessToken } from '../../utils/jwt';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateResetToken, hashToken } from '../../utils/token';
import { authRepository } from './auth.repository';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.dto';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  totalPoints: number;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    totalPoints: user.totalPoints,
  };
}

function issueToken(user: User): AuthResult {
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { token, user: toPublicUser(user) };
}

export const authService = {
  // UC01 — Register
  async register(input: RegisterInput): Promise<{ message: string }> {
    const email = input.email.toLowerCase();
    const existing = await authRepository.findUserByEmail(email);
    if (existing) {
      throw ApiError.conflict('Email đã tồn tại');
    }
    const passwordHash = await hashPassword(input.password);
    await authRepository.createUser({
      email,
      displayName: input.displayName,
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
    });
    return { message: 'Đăng ký thành công' };
  },

  // UC02 — Login (neutral error; does not reveal which field is wrong)
  async login(input: LoginInput): Promise<AuthResult> {
    const invalid = ApiError.unauthorized('Email hoặc mật khẩu không đúng');
    const user = await authRepository.findUserByEmail(input.email.toLowerCase());
    if (!user) {
      throw invalid;
    }
    if (user.status === UserStatus.LOCKED) {
      throw ApiError.forbidden('Tài khoản đã bị khóa');
    }
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw invalid;
    }
    return issueToken(user);
  },

  // UC10 helper — current user
  async me(userId: string): Promise<PublicUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw ApiError.unauthorized();
    }
    return toPublicUser(user);
  },

  // UC15 — Request reset (always neutral response to avoid email enumeration)
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findUserByEmail(input.email.toLowerCase());
    if (!user || user.status === UserStatus.LOCKED) {
      // Equalize timing to prevent email-existence side-channel
      await hashPassword('timing-equalization');
      return;
    }
    await authRepository.invalidateUserResetTokens(user.id);
    const { raw, hash } = generateResetToken();
    const expiresAt = new Date(Date.now() + env.auth.resetTokenTtlMinutes * 60_000);
    await authRepository.createResetToken({ userId: user.id, tokenHash: hash, expiresAt });

    const link = `${env.app.frontendUrl}/reset-password?token=${raw}`;
    await mailer.send({
      to: user.email,
      subject: 'Đặt lại mật khẩu — Football-Lover',
      text: `Nhấn vào liên kết để đặt lại mật khẩu (hết hạn sau ${env.auth.resetTokenTtlMinutes} phút):\n${link}`,
    });
  },

  // UC15 — Reset with token
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);
    const record = await authRepository.findValidResetToken(tokenHash);
    if (!record) {
      throw ApiError.badRequest('Token không hợp lệ hoặc đã hết hạn');
    }
    const passwordHash = await hashPassword(input.newPassword);
    await authRepository.consumeResetToken(record.id, record.userId, passwordHash);
  },
};
