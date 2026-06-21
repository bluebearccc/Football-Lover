import type { PasswordResetToken, Prisma, User } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const authRepository = {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  createResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: {
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        user: { connect: { id: data.userId } },
      },
    });
  },

  invalidateUserResetTokens(userId: string): Promise<void> {
    return prisma.passwordResetToken
      .updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      })
      .then(() => undefined);
  },

  findValidResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  /** Set the new password and consume the token atomically. */
  consumeResetToken(tokenId: string, userId: string, passwordHash: string): Promise<void> {
    return prisma
      .$transaction([
        prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
        prisma.passwordResetToken.update({
          where: { id: tokenId },
          data: { usedAt: new Date() },
        }),
      ])
      .then(() => undefined);
  },
};
