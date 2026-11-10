import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch, ApiError } from './api';

export interface FetchState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
}

function toApiError(e: unknown): ApiError {
  return e instanceof ApiError ? e : new ApiError(0, 'INTERNAL', String(e));
}

/**
 * Fetch sob demanda (sem polling) com estados `loading`/`erro` (§4.3),
 * cleanup no unmount e `reload` para a ação "tentar novamente".
 * `path` nulo desativa a busca (ex.: parâmetro ausente).
 */
export function useFetch<T>(path: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [nonce, setNonce] = useState(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    if (path === null) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setData(null);
    setError(null);
    setLoading(true);

    void (async () => {
      try {
        const result = await apiFetch<T>(path);
        if (!aliveRef.current) return;
        setData(result);
      } catch (e) {
        if (!aliveRef.current) return;
        setError(toApiError(e));
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    })();

    return () => {
      aliveRef.current = false;
    };
  }, [path, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, loading, reload };
}
