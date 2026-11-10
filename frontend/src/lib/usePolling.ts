import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './api';

export interface PollingState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  refresh: () => void;
}

function toApiError(e: unknown): ApiError {
  return e instanceof ApiError ? e : new ApiError(0, 'INTERNAL', String(e));
}

/**
 * Polling de 3s **com cleanup** (§4.2), sem intervalos órfãos:
 * - limpa o `setInterval` no unmount e bloqueia `setState` após desmontar;
 * - **pausa** quando a aba fica oculta (`document.hidden`) e **retoma** ao focar.
 */
export function usePolling<T>(fetcher: () => Promise<T>, intervalMs = 3000): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const aliveRef = useRef(true);

  const tick = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      if (!aliveRef.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      setError(toApiError(e));
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    let id: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (id !== undefined) return;
      void tick();
      id = setInterval(() => void tick(), intervalMs);
    };
    const stop = () => {
      if (id === undefined) return;
      clearInterval(id);
      id = undefined;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (document.hidden) void tick();
    else start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      aliveRef.current = false;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs, tick]);

  const refresh = useCallback(() => {
    void tick();
  }, [tick]);

  return { data, error, loading, refresh };
}
