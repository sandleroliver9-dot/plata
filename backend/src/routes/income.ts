import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { IncomeService } from '../services/incomeService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const incomeCreateSchema = z.object({
  concepto: z.string().min(1),
  monto: z.number().min(0),
  fecha_cobro: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha_cobro debe tener formato YYYY-MM-DD'),
  tipo: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  ajuste_esperado: z.number().nullable().optional(),
});

const incomeUpdateSchema = z.object({
  concepto: z.string().optional(),
  monto: z.number().min(0).optional(),
  fecha_cobro: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tipo: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  ajuste_esperado: z.number().nullable().optional(),
});

// GET /api/income?mes=jun 2026 - List income, optionally filtered by mes financiero
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mes } = req.query as { mes?: string };
    const data = await IncomeService.list(req.userId!, mes);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/income - Create income
router.post('/', authenticateToken, validateBody(incomeCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof incomeCreateSchema>;
    const data = await IncomeService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/income/:id - Update income
router.put('/:id', authenticateToken, validateBody(incomeUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof incomeUpdateSchema>;
    const data = await IncomeService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/income/:id - Delete income
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await IncomeService.softDelete(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
