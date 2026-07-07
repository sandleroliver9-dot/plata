import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerConfig, swaggerOptions } from './config/swagger';
import { securityMiddleware, apiLimiter, sanitizeRequestBody } from './middleware/security';

// Load environment variables
dotenv.config();

// Validate environment
import { env, validateEnv } from './config/env';
validateEnv();

import { logger } from './utils/logger';
import { errorHandler } from './utils/errors';

// Import routes
import profileRoutes from './routes/profile';
import categoriesRoutes from './routes/categories';
import transactionsRoutes from './routes/transactions';
import incomeRoutes from './routes/income';
import billsRoutes from './routes/bills';
import goalsRoutes from './routes/goals';
import investmentsRoutes from './routes/investments';
import quotesRoutes from './routes/quotes';

const app: Express = express();
const PORT = env.PORT;

// Detras de un load balancer / reverse proxy (Render, Railway, etc), express
// necesita esto para leer la IP real del cliente en vez de la del proxy;
// sin esto el rate limiting termina limitando a todos los usuarios por igual.
app.set('trust proxy', 1);

// Security middleware
app.use(securityMiddleware);
app.use(apiLimiter);

// CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.URLENCODED_BODY_LIMIT }));
app.use(sanitizeRequestBody);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const userId = (req as any).userId;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.response(req.method, req.path, res.statusCode, duration);
  });

  logger.request(req.method, req.path, userId);
  next();
});

// Health check (before Swagger to avoid rate limiting issues)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Swagger UI - solo fuera de produccion, para no filtrar el esquema completo
// de la API sin autenticacion.
if (env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig as any, swaggerOptions));
  app.get('/api/docs.json', (req: Request, res: Response) => {
    res.json(swaggerConfig);
  });
}

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/quotes', quotesRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.path}`, error);
  const { status, body } = errorHandler(error);
  res.status(status).json(body);
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});
