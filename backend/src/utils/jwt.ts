import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: Role;
}

export function signAccessToken(claims: AccessTokenClaims): string {
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(claims, env.jwt.secret, options);
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  return jwt.verify(token, env.jwt.secret) as AccessTokenClaims;
}
