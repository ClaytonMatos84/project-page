import type { NextFunction, Request, Response } from 'express';
import type { Envelope } from '@uol/shared';
import { buildMeta, newTraceId } from './telemetry';

/** Estado de telemetria por requisição, guardado em `res.locals`. */
export interface RequestTelemetry {
  startedAt: number;
  traceId: string;
}

function telemetryOf(res: Response): RequestTelemetry {
  const locals = res.locals as Partial<RequestTelemetry>;
  return {
    startedAt: locals.startedAt ?? Date.now(),
    traceId: locals.traceId ?? newTraceId(),
  };
}

/**
 * Middleware que inicia a telemetria da requisição: marca o instante de entrada
 * e resolve o `traceId` (reusa `x-trace-id` se o cliente enviar).
 */
export function envelopeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-trace-id');
  res.locals.startedAt = Date.now();
  res.locals.traceId = incoming && incoming.trim() !== '' ? incoming.trim() : newTraceId();
  next();
}

/**
 * Envia uma resposta de sucesso no envelope único `{ data, meta }`.
 * Mede `latencyMs` no momento do envio (não estimado).
 */
export function sendEnvelope<T>(res: Response, data: T, status = 200): void {
  const { startedAt, traceId } = telemetryOf(res);
  const body: Envelope<T> = {
    data,
    meta: buildMeta(Date.now() - startedAt, traceId),
  };
  res.status(status).json(body);
}

/** Envia uma resposta de erro no envelope `{ data: null, error, meta }`. */
export function sendErrorEnvelope(
  res: Response,
  status: number,
  code: string,
  message: string,
): void {
  const { startedAt, traceId } = telemetryOf(res);
  res.status(status).json({
    data: null,
    error: { code, message },
    meta: buildMeta(Date.now() - startedAt, traceId),
  });
}

export { telemetryOf };
