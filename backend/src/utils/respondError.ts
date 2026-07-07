import { Response } from 'express';
import { errorHandler } from './errors';

// Maneja errores de ruta de forma consistente: usa AppError.status cuando esta
// disponible (validacion, not found, etc) y no reenvia mensajes crudos de
// Supabase u otras libs al cliente para errores no esperados.
export const respondError = (res: Response, error: unknown) => {
  const { status, body } = errorHandler(error);
  res.status(status).json(body);
};
