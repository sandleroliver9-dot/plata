import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { InvestmentsService } from '../services/investmentsService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const investmentBuySchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.number().min(0),
  precio_unitario: z.number().min(0),
  fecha: z.string().min(1),
});

const investmentSellSchema = z.object({
  descripcion: z.string().min(1),
  cantidad: z.number().min(0),
  precio_unitario: z.number().min(0),
  fecha: z.string().min(1),
});

const investmentDividendSchema = z.object({
  descripcion: z.string().min(1),
  monto: z.number().min(0),
  fecha: z.string().min(1),
});

// GET /api/investments/buys - List purchases
router.get('/buys', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listBuys(req.userId!);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/investments/sells - List sales
router.get('/sells', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listSells(req.userId!);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/investments/dividends - List dividends
router.get('/dividends', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await InvestmentsService.listDividends(req.userId!);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/investments/buy - Create purchase
router.post('/buy', authenticateToken, validateBody(investmentBuySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await InvestmentsService.createBuy(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/investments/sell - Create sale
router.post('/sell', authenticateToken, validateBody(investmentSellSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await InvestmentsService.createSell(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/investments/dividend - Create dividend
router.post('/dividend', authenticateToken, validateBody(investmentDividendSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await InvestmentsService.createDividend(req.userId!, payload);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/investments/buy/:id - Delete purchase
router.delete('/buy/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InvestmentsService.deleteBuy(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/investments/sell/:id - Delete sale
router.delete('/sell/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InvestmentsService.deleteSell(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/investments/dividend/:id - Delete dividend
router.delete('/dividend/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await InvestmentsService.deleteDividend(req.userId!, id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
