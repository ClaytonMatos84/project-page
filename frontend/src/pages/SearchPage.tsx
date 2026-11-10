import { useSearchParams } from 'react-router-dom';
import type { Article } from '@uol/shared';
import { useFetch } from '../lib/useFetch';
import { ArticleCard } from '../components/ArticleCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';

/**
 * Tela de busca (`/busca?q=`): resultados, estado vazio dedicado e
 * `role="alert"` no erro crítico (§4.3).
 */
export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const { data, error, loading, reload } = useFetch<Article[]>(
    q ? `/api/portal/search?q=${encodeURIComponent(q)}` : null,
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="m-0 text-xl font-extrabold text-ink">
        {q ? `Resultados para “${q}”` : 'Buscar no UOL'}
      </h1>

      {!q && (
        <EmptyState
          title="Digite um termo para buscar"
          hint="Use o campo de busca no topo para procurar por notícias."
        />
      )}

      {q && loading && <LoadingState label="Buscando…" />}
      {q && error && <ErrorState error={error} onRetry={reload} title="Falha na busca" />}
      {q && !loading && !error && data && data.length === 0 && (
        <EmptyState
          title="Nenhum resultado encontrado"
          hint={`Não encontramos notícias para “${q}”. Tente outro termo.`}
        />
      )}
      {q && data && data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
