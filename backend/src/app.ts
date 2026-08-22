import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { swaggerDocument } from './config/swagger.js';
import apiRouter from './routes/index.js';
import { sendError, sendSuccess } from './utils/response.js';

export const createApp = () => {
  const app = express();

  // Middlewares
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Swagger Documentation UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'Server is healthy');
  });

  // API router
  app.use('/api', apiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND', 404);
  });

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);
    sendError(
      res,
      err.message || 'Internal server error',
      err.code || 'INTERNAL_SERVER_ERROR',
      err.statusCode || 500
    );
  });

  return app;
};
