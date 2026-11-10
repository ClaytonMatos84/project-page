import type { Article, HighlightWithArticle } from '@uol/shared';
import { apiFetch } from '../lib/api';
import { useFetch } from '../lib/useFetch';
import { usePolling } from '../lib/usePolling';
import { ArticleCard } from '../components/ArticleCard';
import { HighlightHero } from '../components/HighlightHero';
import { MostReadList } from '../components/MostReadList';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';

/**
 * Tela `Home` (§3.1): destaque principal com **ênfase máxima no topo**
 * e seção "Últimas notícias" abaixo — cards à esquerda + lista estilo
 * "mais lidas" à direita (padrão uol.com.br, §1). Polling de 3s com
 * `aria-live="polite"` na região atualizada automaticamente.
 */
export function HomePage() {
  const highlights = usePolling<HighlightWithArticle[]>(
    () => apiFetch<HighlightWithArticle[]>('/api/portal/highlights'),
    3000,
  );
  const latest = useFetch<Article[]>('/api/portal/articles?limit=5');

  const { data, error, loading, refresh } = highlights;

  return (
    <div aria-live="polite" aria-busy={loading} className="flex flex-col gap-10">
      <h1 className="sr-only">Destaques e últimas notícias</h1>

      <section aria-label="Destaque principal" className="flex flex-col">
        {loading && !data && <LoadingState label="Carregando destaque…" />}
        {error && !data && <ErrorState error={error} onRetry={refresh} />}
        {data && data.length === 0 && (
          <EmptyState
            title="Nenhum destaque no momento"
            hint="Volte em instantes para ver as manchetes."
          />
        )}
        {data && data.length > 0 && <HighlightHero highlight={data[0]} />}
      </section>

      {data && data.length > 0 && (
        <section aria-labelledby="ultimas-title" className="flex flex-col gap-6">
          <h2 id="ultimas-title" className="m-0 text-xl font-extrabold text-ink">
            Últimas notícias
          </h2>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid content-start gap-5 sm:grid-cols-2">
              {data.slice(1).map((h) => (
                <ArticleCard key={h.articleId} article={h.article} />
              ))}
            </div>

            <aside
              aria-labelledby="mais-lidas-title"
              className="h-fit rounded-md border border-border bg-surface p-4"
            >
              <h3
                id="mais-lidas-title"
                className="m-0 mb-2 border-l-4 border-brand-red pl-2 text-sm font-extrabold uppercase tracking-wider text-ink"
              >
                Mais lidas
              </h3>
              {latest.loading && <LoadingState label="Carregando mais lidas…" />}
              {latest.error && <ErrorState error={latest.error} onRetry={latest.reload} />}
              {latest.data && latest.data.length === 0 && (
                <EmptyState title="Sem notícias no momento" hint="Volte em instantes." />
              )}
              {latest.data && latest.data.length > 0 && <MostReadList articles={latest.data} />}
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
