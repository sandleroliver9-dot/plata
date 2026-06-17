import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { BillsService } from '../services/billsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const billCreateSchema = z.object({
  concepto: z.string().min(1),
  monto: z.number().min(0),
  fecha_vencimiento: z.string().min(1),
  categoria: z.string().nullable().optional(),
});

const billUpdateSchema = z.object({
  concepto: z.string().optional(),
  monto: z.number().optional(),
  fecha_vencimiento: z.string().optional(),
  categoria: z.string().nullable().optional(),
});

// GET /api/bills - List all bills
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
    const payload = req.body as any;
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
    const payload = req.body as any;
    const data = await BillsService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bills/:id/pay - Mark bill as paid
router.patch('/:id/pay', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await BillsService.markAsPaid(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bills/:id - Delete bill
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await BillsService.softDelete(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
