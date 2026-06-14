import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { ProfileService } from '../services/profileService';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

const profileUpdateSchema = z.object({
  pay_day: z.number().int().min(1).max(31).optional(),
  salary: z.number().min(0).optional(),
  saving_target: z.number().min(0).optional(),
  financial_center: z.string().nullable().optional(),
});

// GET /api/profile - Get current user profile
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await ProfileService.getProfile(req.userId!);
    res.json(data ?? null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile - Update user profile
router.put('/', authenticateToken, validateBody(profileUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body as any;
    const data = await ProfileService.updateProfile(req.userId!, payload);
    res.json(data ?? null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
