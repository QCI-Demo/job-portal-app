import type { RequestHandler } from 'express';
import { UserRole } from '../entity/User.js';

/** Must run after `authenticate`. Only `employer` (and `admin` for management) may pass. */
export const requireEmployer: RequestHandler = (req, res, next) => {
  const role = req.auth?.role;
  if (!role) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  if (role !== UserRole.EMPLOYER) {
    res.status(403).json({ message: 'Employer role required' });
    return;
  }
  next();
};
