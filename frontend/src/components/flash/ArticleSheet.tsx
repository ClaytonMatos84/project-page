import type { Short } from '@uol/shared';
import { useDialog } from '../../lib/useDialog';
import { useFetch } from '../../lib/useFetch';
import { editoriaColorVar, editoriaOnColor } from '../../lib/editorias';
import { CloseIcon } from './Icons';

/**
 * Bottom sheet "Ler Matéria Completa" (spec `flash-frontend-core`):
 * condicional a `articleUrl`; busca o detalhe via `GET /shorts/:id`;
 * `role="dialog"` + focus trap + `Esc` + retorno de foco; ação externa com
 * `target="_blank"` e `rel="noopener noreferrer"`.
 */
export function ArticleSheet({
  short,
  onClose,
}: {
  short: Short;
  onClose: () => void;
}) {
  const dialogRef = useDialog(true, onClose);
  const detail = useFetch<Short>(`/api/flash/shorts/${short.id}`);
  const current: Short = detail.data ?? short;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-2 pb-2">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="flex max-h-[80%] flex-col gap-3 overflow-y-auto rounded-t-md border border-border bg-surface p-4 text-content shadow-2xl"
      >
        <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted/60" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold"
            style={{
              backgroundColor: editoriaColorVar(current.editoria),
              color: editoriaOnColor(current.editoria),
            }}
          >
            {current.editoria}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar matéria"
            className="rounded-full p-1.5 text-muted transition-colors hover:text-content active:scale-95"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <h2 id="sheet-title" className="m-0 text-lg font-extrabold leading-tight text-ink">
          {current.title}
        </h2>
        <p className="m-0 text-sm text-content">{current.body}</p>

        <p className="font-telemetry m-0 text-xs text-muted">
          {Math.max(1, Math.round(current.durationMs / 1000))}s de leitura ·{' '}
          {current.reactions} curtidas
        </p>

        {current.articleUrl && (
          <a
            href={current.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center justify-center rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white no-underline transition-colors hover:bg-brand-red-dark active:scale-95"
          >
            Abrir matéria original
          </a>
        )}
      </div>
    </div>
  );
}
