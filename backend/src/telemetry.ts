import { randomUUID } from 'node:crypto';
import { CONTRACT_VERSION, type ResponseMeta } from '@uol/shared';

/** Gera um traceId único por requisição (correlação, inclusive em erro). */
export function newTraceId(): string {
  return randomUUID();
}

/** Monta a telemetria obrigatória do envelope (§4.1). */
export function buildMeta(latencyMs: number, traceId: string): ResponseMeta {
  return {
    latencyMs: Math.max(0, Math.round(latencyMs)),
    contract: CONTRACT_VERSION,
    traceId,
    ts: new Date().toISOString(),
  };
}
