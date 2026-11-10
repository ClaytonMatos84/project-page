import { useParams } from 'react-router-dom';
import type { Article, Editoria } from '@uol/shared';
import { useFetch } from '../lib/useFetch';
import { editoriaColorVar, editoriaOnColor } from '../lib/editorias';
import { ArticleCard } from '../components/ArticleCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';

/**
 * Tela `Editoria` (`/editoria/:slug`): lista de artigos da editoria
 * com estados `loading`/`erro`/`vazio` (§4.3).
 */
export function EditoriaPage() {
  const { slug = '' } = useParams();
  const editorias = useFetch<Editoria[]>('/api/portal/editorias');
  const articles = useFetch<Article[]>(
    slug ? `/api/portal/articles?editoria=${encodeURIComponent(slug)}&limit=20` : null,
  );

  const editoria = editorias.data?.find((e) => e.slug === slug);
  const color = editoriaColorVar(slug);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <span
          className="inline-flex w-fit rounded-xs px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ background: color, color: editoriaOnColor(slug) }}
        >
          Editoria
        </span>
        <h1 className="m-0 text-2xl font-extrabold text-ink">
          {editoria?.name ?? slug}
        </h1>
      </header>

      {articles.loading && <LoadingState label="Carregando artigos…" />}
      {articles.error && <ErrorState error={articles.error} onRetry={articles.reload} />}
      {!articles.loading && !articles.error && articles.data && articles.data.length === 0 && (
        <EmptyState
          title="Nenhum artigo nesta editoria"
          hint="Ainda não há publicações por aqui. Tente outra editoria."
        />
      )}
      {!articles.loading && !articles.error && articles.data && articles.data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.data.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
