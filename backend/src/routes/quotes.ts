import { Router, Response } from 'express';
import { QuotesService } from '../services/quotesService';
import { respondError } from '../utils/respondError';

const router = Router();

// GET /api/quotes/dolar - Get dollar quotes
router.get('/dolar', async (req, res: Response) => {
  try {
    const data = await QuotesService.getDolares();
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

// GET /api/quotes/inflation - Get inflation data
router.get('/inflation', async (req, res: Response) => {
  try {
    const data = await QuotesService.getInflacion();
    res.json(data);
  } catch (err) {
    respondError(res, err);
  }
});

export default router;
