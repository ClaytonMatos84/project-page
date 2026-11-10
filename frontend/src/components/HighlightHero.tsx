import { Link } from 'react-router-dom';
import type { HighlightWithArticle } from '@uol/shared';
import { editoriaColorVar, editoriaOnColor } from '../lib/editorias';
import { formatBrDateTime } from '../lib/telemetry';

/**
 * Bloco de destaque principal (hero) da home (§ portal-highlights):
 * no topo com ênfase máxima — imagem em largura total e manchete ampliada,
 * espelhando a manchete principal do uol.com.br (§1).
 */
export function HighlightHero({ highlight }: { highlight: HighlightWithArticle }) {
  const { article } = highlight;
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
      <div className="aspect-[16/7] w-full overflow-hidden bg-surface-2 sm:aspect-[21/9]">
        <img src={article.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-3 p-5 sm:p-7">
        <span
          className="inline-flex w-fit rounded-xs px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{
            background: editoriaColorVar(article.editoria),
            color: editoriaOnColor(article.editoria),
          }}
        >
          {highlight.label}
        </span>
        <h2 className="m-0 text-2xl font-extrabold leading-tight text-ink sm:text-4xl">
          <Link to={article.url} className="text-inherit no-underline hover:underline">
            {article.title}
          </Link>
        </h2>
        <p className="m-0 max-w-3xl text-sm text-muted sm:text-base">{article.summary}</p>
        <time className="font-telemetry text-xs text-muted" dateTime={article.publishedAt}>
          {formatBrDateTime(article.publishedAt)}
        </time>
      </div>
    </article>
  );
}
