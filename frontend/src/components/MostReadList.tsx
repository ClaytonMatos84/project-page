import { Link } from 'react-router-dom';
import type { Article } from '@uol/shared';
import { editoriaColorVar } from '../lib/editorias';

/**
 * Lista numerada de notícias no padrão do bloco "mais lidas" do uol.com.br (§1):
 * número em destaque na cor da marca + título com hover sublinhado,
 * divisores finos entre itens.
 */
export function MostReadList({ articles }: { articles: Article[] }) {
  return (
    <ol className="m-0 flex list-none flex-col divide-y divide-border p-0">
      {articles.map((article, index) => (
        <li key={article.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span
            aria-hidden="true"
            className="w-7 shrink-0 text-center text-2xl font-extrabold leading-none text-brand-red"
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              to={article.url}
              className="text-sm font-semibold leading-snug text-content no-underline hover:underline"
            >
              {article.title}
            </Link>
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider"
              style={{ color: editoriaColorVar(article.editoria) }}
            >
              {article.editoria}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
