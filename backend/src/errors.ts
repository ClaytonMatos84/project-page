import type { NextFunction, Request, Response } from 'express';
import { ERROR_CODE_BY_STATUS, type ApiErrorCode } from '@uol/shared';
import { sendErrorEnvelope } from './envelope';

/** Erro HTTP tipado do backend. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown): HttpError =>
  new HttpError(400, 'BAD_REQUEST', message, details);

export const notFound = (message = 'Resource not found'): HttpError =>
  new HttpError(404, 'NOT_FOUND', message);

export const internal = (message = 'Internal server error'): HttpError =>
  new HttpError(500, 'INTERNAL', message);

/** Handler 404 para rotas não mapeadas. */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(notFound('Route not found'));
}

/**
 * Handler de erro padronizado: sempre `data: null`, `error.code`/`error.message`
 * e `meta.latencyMs`/`meta.traceId` presentes (§4.1). Erros não-HTTP viram `500 INTERNAL`.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    sendErrorEnvelope(res, err.status, err.code, err.message);
    return;
  }

  const code: ApiErrorCode = ERROR_CODE_BY_STATUS[500] ?? 'INTERNAL';
  const message = err instanceof Error && err.message ? err.message : 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('[error]', err);
  }

  sendErrorEnvelope(res, 500, code, message);
}
