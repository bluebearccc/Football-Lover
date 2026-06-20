import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

interface JwtClaims {
  sub: string;
  email: string;
  role: Role;
}

/** Require a valid Bearer token; attaches `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized();
  }
  const token = header.slice('Bearer '.length);
  try {
    const claims = jwt.verify(token, env.jwt.secret) as JwtClaims;
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
