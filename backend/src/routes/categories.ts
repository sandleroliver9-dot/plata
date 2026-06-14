import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { CategoriesService } from '../services/categoriesService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

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

// GET /api/categories - List all categories for user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await CategoriesService.list(req.userId!);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories - Create new category
router.post('/', authenticateToken, validateBody(categoryCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await CategoriesService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', authenticateToken, validateBody(categoryUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as any;
    const data = await CategoriesService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id - Soft delete category
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await CategoriesService.softDelete(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
