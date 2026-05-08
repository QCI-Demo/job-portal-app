import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UserRole } from '../entity/User.js';

function getBearerToken(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.slice('Bearer '.length).trim() || null;
}

/** Requires a valid JWT and attaches `req.auth`. */
export const authenticate: RequestHandler = (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const { sub, role } = verifyAccessToken(token, secret);
    if (!Object.values(UserRole).includes(role)) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    req.auth = { userId: sub, role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
