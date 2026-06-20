import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

/** Require a valid Bearer token; attaches `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized();
  }
  const token = header.slice('Bearer '.length);
  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, email: claims.email, role: claims.role };
    next();
  } catch {
    throw ApiError.unauthorized();
  }
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
