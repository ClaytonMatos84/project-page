import { Link } from 'react-router-dom';
import type { Article } from '@uol/shared';
import { editoriaColorVar, editoriaOnColor } from '../lib/editorias';
import { formatBrDateTime } from '../lib/telemetry';

/** Card de notícia seguindo o gabarito UOL (kicker + hierarquia + tokens). */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-border bg-surface transition-colors hover:border-brand-red">
      <div className="aspect-video w-full overflow-hidden bg-surface-2">
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span
          className="inline-flex w-fit rounded-xs px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider"
          style={{
            background: editoriaColorVar(article.editoria),
            color: editoriaOnColor(article.editoria),
          }}
        >
          {article.editoria}
        </span>
        <h3 className="m-0 text-base font-extrabold leading-snug text-ink">
          <Link to={article.url} className="text-inherit no-underline hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="m-0 flex-1 text-sm text-muted">{article.summary}</p>
        <time className="font-telemetry text-xs text-muted" dateTime={article.publishedAt}>
          {formatBrDateTime(article.publishedAt)}
        </time>
      </div>
    </article>
  );
}
