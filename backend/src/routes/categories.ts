import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { CategoriesService } from '../services/categoriesService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { parsePaginationParams } from '../utils/pagination';
import { respondError } from '../utils/respondError';

const router = Router();

const categoryCreateSchema = z.object({
  nombre: z.string().min(1),
  tipo: z.string().min(1),
  color: z.string().nullable().optional(),
  prioridad: z.string().nullable().optional(),
});

const categoryUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  tipo: z.string().min(1).optional(),
  color: z.string().nullable().optional(),
  prioridad: z.string().nullable().optional(),
});

// GET /api/categories - List categories with pagination
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);
    const { data } = await CategoriesService.list(req.userId!, page, limit);
    // Todos los demas endpoints (income, transactions, bills, goals,
    // investments, profile) devuelven el array/objeto plano. Este era el
    // unico envuelto en {success,data,pagination,timestamp}: categoriasQuery
    // (src/lib/queries.ts) espera un array y lo pasa directo a
    // categoryNamesFor, que hace .filter() sobre lo que reciba — con el
    // envelope, eso tira TypeError apenas el backend queda conectado.
    res.json(data);
  } catch (error) {
    respondError(res, error);
  }
});

// POST /api/categories - Create category
router.post('/', authenticateToken, validateBody(categoryCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await CategoriesService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (error) {
    respondError(res, error);
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', authenticateToken, validateBody(categoryUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as any;
    const data = await CategoriesService.update(req.userId!, id, payload);
    res.json(data);
  } catch (error) {
    respondError(res, error);
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await CategoriesService.softDelete(req.userId!, id);
    res.status(204).send();
  } catch (error) {
    respondError(res, error);
  }
});

export default router;

