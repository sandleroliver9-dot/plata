import { ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.flatten();
        logger.warn('Validation error', { path: req.path, errors });
        const error = new ValidationError('Request validation failed', errors);
        return res.status(error.status).json({
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          timestamp: new Date().toISOString(),
        });
      }
      // Overwrite body with parsed data
      req.body = result.data as any;
      next();
    } catch (err) {
      logger.error('Validation middleware error', err);
      return res.status(500).json({
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  };
};
