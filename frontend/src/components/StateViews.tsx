import type { ReactNode } from 'react';
import { ApiError } from '../lib/api';

/** Skeleton de carregamento — nunca tela branca (§4.3). */
export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      <div className="h-44 w-full animate-pulse rounded-sm bg-surface-2" />
      <div className="h-4 w-2/3 animate-pulse rounded-xs bg-surface-2" />
      <div className="h-4 w-1/2 animate-pulse rounded-xs bg-surface-2" />
    </div>
  );
}

/** Estado de erro — mensagem clara + ação "tentar novamente" (§4.3). */
export function ErrorState({
  error,
  onRetry,
  title = 'Não foi possível carregar o conteúdo',
}: {
  error: ApiError | null;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <div role="alert" className="rounded-sm border border-border bg-surface p-6">
      <p className="m-0 text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-content">{error?.message ?? 'Erro inesperado.'}</p>
      {error && error.status > 0 && (
        <p className="font-telemetry mt-1 text-xs text-muted">
          HTTP {error.status} · {error.code}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

/** Estado vazio dedicado, com orientação (§4.3). */
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-surface p-8 text-center">
      <p className="m-0 text-sm font-bold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
