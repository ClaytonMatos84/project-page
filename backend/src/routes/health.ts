import { Router } from 'express';
import { CONTRACT_VERSION } from '@uol/shared';
import { sendEnvelope } from '../envelope';

export const healthRouter: Router = Router();

/**
 * GET /health — integridade do serviço.
 * Retorna `status`, `uptimeMs` e `version`, dentro do envelope com telemetria.
 */
healthRouter.get('/health', (_req, res) => {
  sendEnvelope(res, {
    status: 'ok',
    uptimeMs: Math.round(process.uptime() * 1000),
    version: CONTRACT_VERSION,
  });
});
