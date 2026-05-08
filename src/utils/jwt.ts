import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '../entity/User.js';

export type JwtPayload = {
  sub: string;
  role: UserRole;
};

export function signAccessToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions['expiresIn'] = '1h',
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign({ sub: payload.sub, role: payload.role }, secret, options);
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload & {
    sub?: string;
    role?: UserRole;
  };
  if (!decoded.sub || !decoded.role) {
    throw new Error('Invalid token payload');
  }
  return { sub: decoded.sub, role: decoded.role };
}
