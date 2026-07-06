import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { BillsService } from '../services/billsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const billCreateSchema = z.object({
  concepto: z.string().min(1),
  monto: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
  recurrente: z.boolean().optional(),
  notas: z.string().nullable().optional(),
});

const billUpdateSchema = z.object({
  concepto: z.string().optional(),
  monto: z.number().min(0).optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recurrente: z.boolean().optional(),
  notas: z.string().nullable().optional(),
});

const billPaySchema = z.object({
  pagado: z.boolean().optional(),
});

// GET /api/bills - List manual bills (vencimientos)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await BillsService.list(req.userId!);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills - Create bill
router.post('/', authenticateToken, validateBody(billCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof billCreateSchema>;
    const data = await BillsService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bills/:id - Update bill
router.put('/:id', authenticateToken, validateBody(billUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof billUpdateSchema>;
    const data = await BillsService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bills/:id/pay - Mark bill as paid (or unpaid with { pagado: false })
router.patch('/:id/pay', authenticateToken, validateBody(billPaySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { pagado } = req.body as z.infer<typeof billPaySchema>;
    const data = await BillsService.setPaid(req.userId!, id, pagado ?? true);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bills/:id - Delete bill (hard delete: no `activo` column on vencimientos)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await BillsService.remove(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
