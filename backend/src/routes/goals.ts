import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { GoalsService } from '../services/goalsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { respondError } from '../utils/respondError';

const router = Router();

const goalCreateSchema = z.object({
  meta: z.string().min(1),
  objetivo: z.number().min(0),
  ahorrado: z.number().min(0).optional(),
  moneda: z.string().optional(),
  fecha_objetivo: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

const goalUpdateSchema = z.object({
  meta: z.string().optional(),
  objetivo: z.number().min(0).optional(),
  ahorrado: z.number().min(0).optional(),
  moneda: z.string().optional(),
  fecha_objetivo: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

const goalProgressSchema = z.object({
  ahorrado: z.number().min(0),
});

// GET /api/goals - List all goals
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await GoalsService.list(req.userId!);
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// POST /api/goals - Create goal
router.post('/', authenticateToken, validateBody(goalCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof goalCreateSchema>;
    const data = await GoalsService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// PUT /api/goals/:id - Update goal
router.put('/:id', authenticateToken, validateBody(goalUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof goalUpdateSchema>;
    const data = await GoalsService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// PATCH /api/goals/:id/progress - Update goal progress
router.patch('/:id/progress', authenticateToken, validateBody(goalProgressSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ahorrado } = req.body as z.infer<typeof goalProgressSchema>;
    const data = await GoalsService.updateProgress(req.userId!, id, ahorrado);
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// DELETE /api/goals/:id - Delete goal (hard delete: no `activo` column on metas)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await GoalsService.remove(req.userId!, id);
    res.status(204).send();
  } catch (err) {
    respondError(res, err);
  }
});

export default router;
