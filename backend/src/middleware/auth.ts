import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { UserStatus } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../lib/prisma';

/** Require a valid Bearer token; attaches `req.user`. Rejects LOCKED accounts. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized();
  }
  const token = header.slice('Bearer '.length);
  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, email: claims.email, role: claims.role };
  } catch {
    throw ApiError.unauthorized();
  }

  prisma.user
    .findUnique({ where: { id: req.user.id }, select: { status: true } })
    .then((user) => {
      if (!user || user.status === UserStatus.LOCKED) {
        next(ApiError.forbidden('Tài khoản đã bị khoá'));
        return;
      }
      next();
    })
    .catch(next);
}

/** Attach user if valid JWT present; do NOT reject if absent or invalid. */
export function tryAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  try {
    const claims = verifyAccessToken(header.slice('Bearer '.length));
    req.user = { id: claims.sub, email: claims.email, role: claims.role };
  } catch {
    // invalid token — proceed as guest
  }
  next();
}

/** Require the authenticated user to have one of the given roles. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }
    next();
  };
}
