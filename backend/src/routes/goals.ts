import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { GoalsService } from '../services/goalsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const goalCreateSchema = z.object({
  nombre: z.string().min(1),
  monto_objetivo: z.number().min(0),
  fecha_target: z.string().optional(),
});

const goalUpdateSchema = z.object({
  nombre: z.string().optional(),
  monto_objetivo: z.number().optional(),
  fecha_target: z.string().nullable().optional(),
});

const goalProgressSchema = z.object({
  monto_actual: z.number().min(0),
});

// GET /api/goals - List all goals
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await GoalsService.list(req.userId!);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals - Create goal
router.post('/', authenticateToken, validateBody(goalCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await GoalsService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id - Update goal
router.put('/:id', authenticateToken, validateBody(goalUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as any;
    const data = await GoalsService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/goals/:id/progress - Update goal progress
router.patch('/:id/progress', authenticateToken, validateBody(goalProgressSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { monto_actual } = req.body as any;
    const data = await GoalsService.updateProgress(req.userId!, id, monto_actual);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await GoalsService.softDelete(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
