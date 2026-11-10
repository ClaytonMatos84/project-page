import type { ResponseMeta } from '@uol/shared';

/** Formata latência inteira em ms (ex.: `42 ms`). */
export function formatLatency(ms: number): string {
  return `${Math.round(ms)} ms`;
}

/** Formata timestamp ISO no padrão BR: `DD/MM/AAAA · HHhMM`. */
export function formatBrDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` +
    ` · ${pad(date.getHours())}h${pad(date.getMinutes())}`
  );
}

/** Resumo textual da telemetria do envelope, para rodapés técnicos. */
export function summarizeMeta(meta: ResponseMeta): string {
  return `contract ${meta.contract} · ${formatLatency(meta.latencyMs)} · ${formatBrDateTime(meta.ts)}`;
}
