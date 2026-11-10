import type { ResponseMeta } from '@uol/shared';
import { formatLatency } from '../lib/telemetry';

interface TelemetryMetaProps {
  meta: ResponseMeta;
}

/**
 * Renderiza a telemetria do envelope em JetBrains Mono (§5.3).
 * Região atualizada por polling deve usar `aria-live="polite"` (§4.3).
 */
export function TelemetryMeta({ meta }: TelemetryMetaProps) {
  return (
    <dl
      className="font-telemetry flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted"
      aria-live="polite"
    >
      <div className="flex items-center gap-1">
        <dt className="sr-only">Contrato</dt>
        <dd>{meta.contract}</dd>
      </div>
      <span aria-hidden="true" className="text-border">
        |
      </span>
      <div className="flex items-center gap-1">
        <dt className="sr-only">Latência</dt>
        <dd>{formatLatency(meta.latencyMs)}</dd>
      </div>
      <span aria-hidden="true" className="text-border">
        |
      </span>
      <div className="flex min-w-0 items-center gap-1">
        <dt className="sr-only">traceId</dt>
        <dd className="truncate" title={meta.traceId}>
          {meta.traceId}
        </dd>
      </div>
    </dl>
  );
}
