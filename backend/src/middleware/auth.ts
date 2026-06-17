import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      logger.warn('Missing auth token', { path: req.path });
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET);
    req.userId = (decoded as any).sub;
    logger.debug('Auth successful', { userId: req.userId });
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        code: err.code,
        timestamp: new Date().toISOString(),
      });
    }
    logger.error('Auth error', err);
    const error = new ForbiddenError('Invalid token');
    return res.status(error.status).json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }
};
