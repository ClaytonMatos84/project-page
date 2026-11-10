import { ApiError, type Envelope, type ErrorEnvelope } from '@uol/shared';

/**
 * Camada de dados do portal (§4.2).
 *
 * `apiFetch<T>()` tipa a resposta pelo contrato e **desembrulha** o `data`
 * do envelope `{ data, meta }`. Erros viram `ApiError` tipada (status/code),
 * nunca `throw` de string. Nenhum dado é hardcoded na UI além de fallback.
 */

/** Base da API (:3001). Configurável por `VITE_API_URL`. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
).replace(/\/+$/, '');

export { ApiError };

/** Constrói a URL absoluta de um caminho relativo da API. */
export function apiUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;
}

/** Lê o corpo JSON com tolerância a respostas vazias/ inválidas. */
async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === '') return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Fetch tipado que desembrulha o `data` do envelope.
 * Lança `ApiError` (status/code/message/traceId) em falha de rede ou de contrato.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    const headers = new Headers(init?.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    res = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    throw new ApiError(0, 'INTERNAL', `Falha de rede ao chamar ${path}`, undefined);
  }

  const body = await readJson(res);
  const envelope = body as Partial<Envelope<T>> & Partial<ErrorEnvelope> | null;

  if (!res.ok || (envelope && 'error' in envelope && envelope.error)) {
    throw new ApiError(
      res.status,
      envelope?.error?.code ?? 'INTERNAL',
      envelope?.error?.message ?? `Erro ${res.status} em ${path}`,
      envelope?.meta?.traceId,
    );
  }

  if (!envelope || !('data' in envelope)) {
    throw new ApiError(res.status, 'INTERNAL', `Resposta sem envelope em ${path}`, undefined);
  }

  return envelope.data as T;
}
