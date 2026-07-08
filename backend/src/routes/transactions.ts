import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { TransactionsService } from '../services/transactionsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { respondError } from '../utils/respondError';

const router = Router();

// La tabla `movimientos` tiene un CHECK (tipo IN ('Ingreso','Gasto')).
const transactionTipoEnum = z.enum(['Ingreso', 'Gasto']);

export const transactionCreateSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
  descripcion: z.string().nullable().optional(),
  // .min(0), como income/bills: sin esto un monto negativo se guardaba tal
  // cual, y dashboard.tsx suma "Gasto".monto directo al total de gastos, asi
  // que un movimiento negativo restaba en vez de sumar y subestimaba el gasto
  // real del mes.
  monto: z.number().min(0),
  tipo: transactionTipoEnum,
  categoria: z.string().nullable().optional(),
  medio: z.string().nullable().optional(),
  tarjeta: z.string().nullable().optional(),
  es_cuota: z.boolean().optional(),
  cuota_origen_id: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

const transactionUpdateSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  descripcion: z.string().nullable().optional(),
  monto: z.number().min(0).optional(),
  tipo: transactionTipoEnum.optional(),
  categoria: z.string().nullable().optional(),
  medio: z.string().nullable().optional(),
  tarjeta: z.string().nullable().optional(),
  es_cuota: z.boolean().optional(),
  cuota_origen_id: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

// GET /api/transactions?mes=jun 2026 - List transactions for a financial month
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mes } = req.query as { mes?: string };
    const data = await TransactionsService.list(req.userId!, mes);
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// POST /api/transactions - Create transaction
router.post('/', authenticateToken, validateBody(transactionCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof transactionCreateSchema>;
    const data = await TransactionsService.create(req.userId!, payload);
    res.status(201).json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', authenticateToken, validateBody(transactionUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof transactionUpdateSchema>;
    const data = await TransactionsService.update(req.userId!, id, payload);
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// DELETE /api/transactions/:id - Soft delete transaction
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await TransactionsService.softDelete(req.userId!, id);
    res.status(204).send();
  } catch (err) {
    respondError(res, err);
  }
});

export default router;
