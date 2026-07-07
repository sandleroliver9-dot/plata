import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { InvestmentsService } from '../services/investmentsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { respondError } from '../utils/respondError';

const router = Router();

const assetCreateSchema = z.object({
  nombre: z.string().min(1),
  ticker: z.string().nullable().optional(),
  tipo: z.string().min(1),
  sector: z.string().nullable().optional(),
  moneda_base: z.string().optional(),
  notas: z.string().nullable().optional(),
});

// precio_usd/monto_usd permiten 0 (activos regalados, airdrops, dividendos
// simbolicos): la cantidad si tiene que ser positiva, no existe "comprar 0".
const investmentBuySchema = z.object({
  activo_id: z.string().min(1),
  cantidad: z.number().positive(),
  precio_usd: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
  tc: z.number().positive().nullable().optional(),
  broker: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
});

const investmentSellSchema = z.object({
  activo_id: z.string().min(1),
  cantidad: z.number().positive(),
  precio_usd: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
  tc: z.number().positive().nullable().optional(),
  notas: z.string().nullable().optional(),
});

const investmentDividendSchema = z.object({
  activo_id: z.string().min(1),
  monto_usd: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
  tc: z.number().positive().nullable().optional(),
  notas: z.string().nullable().optional(),
});

// GET /api/investments/assets - List investment assets
router.get('/assets', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listAssets(req.userId!);
    res.json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// POST /api/investments/assets - Create investment asset
router.post('/assets', authenticateToken, validateBody(assetCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof assetCreateSchema>;
    const data = await InvestmentsService.createAsset(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// GET /api/investments/buys - List purchases
router.get('/buys', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listBuys(req.userId!);
    res.json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// GET /api/investments/sells - List sales
router.get('/sells', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listSells(req.userId!);
    res.json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// GET /api/investments/dividends - List dividends
router.get('/dividends', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listDividends(req.userId!);
    res.json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// POST /api/investments/buy - Create purchase
router.post('/buy', authenticateToken, validateBody(investmentBuySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof investmentBuySchema>;
    const data = await InvestmentsService.createBuy(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// POST /api/investments/sell - Create sale
router.post('/sell', authenticateToken, validateBody(investmentSellSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof investmentSellSchema>;
    const data = await InvestmentsService.createSell(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// POST /api/investments/dividend - Create dividend
router.post('/dividend', authenticateToken, validateBody(investmentDividendSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as z.infer<typeof investmentDividendSchema>;
    const data = await InvestmentsService.createDividend(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    respondError(res, err);
  }
});

// DELETE /api/investments/buy/:id - Delete purchase
router.delete('/buy/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InvestmentsService.deleteBuy(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    respondError(res, err);
  }
});

// DELETE /api/investments/sell/:id - Delete sale
router.delete('/sell/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InvestmentsService.deleteSell(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    respondError(res, err);
  }
});

// DELETE /api/investments/dividend/:id - Delete dividend
router.delete('/dividend/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InvestmentsService.deleteDividend(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    respondError(res, err);
  }
});

export default router;
