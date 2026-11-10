import express, { type Express } from 'express';
import cors from 'cors';
import { envelopeMiddleware } from './envelope';
import { errorHandler, notFoundHandler } from './errors';
import { healthRouter } from './routes/health';
import { portalRouter } from './routes/portal';
import { flashRouter } from './routes/flash';

/**
 * Monta o app Express da sprint.
 * Ordem dos middlewares importa: telemetria -> CORS -> rotas -> 404 -> erro.
 */
export function createApp(): Express {
  const app = express();

  // Telemetria primeiro: toda resposta (inclusive erro) tem meta preenchido.
  app.use(envelopeMiddleware);

  // CORS liberado em desenvolvimento (§2.1/§4.1).
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-trace-id'],
      exposedHeaders: ['x-trace-id'],
    }),
  );

  // Corpo JSON com charset explícito.
  app.use(express.json({ limit: '1mb' }));

  // Respostas sempre `application/json; charset=utf-8` (default do express.json).
  app.set('json spaces', 0);

  app.use(healthRouter);

  // Rotas de produto — Mini Portal UOL (§3.1).
  app.use(portalRouter);

  // Rotas de produto — UOL Flash Short (§3.2).
  app.use(flashRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
