import { ZodSchema, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: ZodSchema<ZodTypeAny>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    // overwrite body with parsed data
    req.body = result.data as any;
    next();
  };
};
