/**
 * Contrato de convenção de API da sprint UOL (capability `api-convention`).
 *
 * Envelope único `{ data, meta }` com telemetria (`latencyMs`, `contract`,
 * `traceId`, `ts`) e formato de erro padronizado (`data: null`).
 *
 * SOMENTE LEITURA para as tracks B/C. Alteração exige nova spec (Track A).
 */

export const CONTRACT_VERSION = 'v1' as const;
export type ContractVersion = typeof CONTRACT_VERSION;

/** Telemetria obrigatória em toda resposta (§4.1). */
export interface ResponseMeta {
  /** Latência do handler em ms (inteiro). */
  latencyMs: number;
  /** Versão do contrato. */
  contract: ContractVersion;
  /** Correlação única por requisição, inclusive em erro. */
  traceId: string;
  /** Timestamp ISO 8601. */
  ts: string;
}

/** Envelope de sucesso: `{ data, meta }`. */
export interface Envelope<T> {
  data: T;
  meta: ResponseMeta;
}

/** Códigos de erro do contrato. */
export type ApiErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'INTERNAL';

/** Corpo de erro padronizado. */
export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
}

/** Envelope de erro: `{ data: null, error, meta }`. */
export interface ErrorEnvelope {
  data: null;
  error: ApiErrorBody;
  meta: ResponseMeta;
}

/** Mapa status HTTP -> código de erro do contrato. */
export const ERROR_CODE_BY_STATUS: Readonly<Record<number, ApiErrorCode>> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  500: 'INTERNAL',
};

/**
 * Erro tipado do data layer do frontend (§4.2).
 * Nunca lançar string — sempre `ApiError`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly traceId?: string;

  constructor(status: number, code: ApiErrorCode, message: string, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}
