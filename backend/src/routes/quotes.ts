import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { QuotesService } from '../services/quotesService';

const router = Router();

// GET /api/quotes/dolar - Get dollar quotes
router.get('/dolar', async (req, res: Response) => {
  try {
    const data = await QuotesService.getDolares();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/inflation - Get inflation data
router.get('/inflation', async (req, res: Response) => {
  try {
    const data = await QuotesService.getInflacion();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
