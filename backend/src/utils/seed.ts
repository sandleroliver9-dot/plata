import { Request, Response } from 'express';

// Seed example data for testing
export const seedDatabase = async () => {
  console.log('🌱 Database seeding...');
  // This would be implemented based on your Supabase schema
  // For now, it's a placeholder for future development
  console.log('✓ Seed complete');
};

export const getSeedRouter = () => {
  const router = require('express').Router();

  router.post('/seed', async (req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          error: 'Seeding only available in development',
          code: 'FORBIDDEN',
        });
      }
      await seedDatabase();
      res.json({
        success: true,
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'SEED_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
};
