import { Link, useParams } from 'react-router-dom';
import type { Article } from '@uol/shared';
import { useFetch } from '../lib/useFetch';
import { editoriaColorVar, editoriaOnColor, editoriaPath } from '../lib/editorias';
import { formatBrDateTime } from '../lib/telemetry';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';

/**
 * Tela `Leitura` (`/leitura/:id`): detalhe do conteúdo.
 * `404` recebe tratamento dedicado; demais erros, mensagem + "tentar novamente".
 */
export function LeituraPage() {
  const { id = '' } = useParams();
  const { data: article, error, loading, reload } = useFetch<Article>(
    id ? `/api/portal/articles/${encodeURIComponent(id)}` : null,
  );

  if (loading) return <LoadingState label="Carregando matéria…" />;

  if (error && error.status === 404) {
    return (
      <div className="flex flex-col items-start gap-4">
        <EmptyState
          title="Conteúdo não encontrado"
          hint={`Não localizamos a matéria "${id}". Ela pode ter sido removida ou o link está incorreto.`}
        />
        <Link
          to="/"
          className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white no-underline transition-colors hover:bg-brand-red-dark active:scale-95"
        >
          Voltar para a home
        </Link>
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={reload} />;

  if (!article) {
    return <EmptyState title="Nada para exibir" hint="Selecione uma matéria na home." />;
  }

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span
          className="inline-flex w-fit rounded-xs px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider"
          style={{ background: editoriaColorVar(article.editoria), color: editoriaOnColor(article.editoria) }}
        >
          <Link to={editoriaPath(article.editoria)} className="text-inherit no-underline">
            {article.editoria}
          </Link>
        </span>
        <h1 className="m-0 text-3xl font-extrabold leading-tight text-ink">{article.title}</h1>
        <time className="font-telemetry text-xs text-muted" dateTime={article.publishedAt}>
          {formatBrDateTime(article.publishedAt)}
        </time>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-surface-2">
        <img src={article.imageUrl} alt={article.title} className="h-auto w-full object-cover" />
      </div>

      <p className="m-0 text-lg leading-relaxed text-content">{article.summary}</p>

      <div className="border-t border-border pt-4">
        <Link to="/" className="text-sm font-bold text-brand-blue no-underline hover:underline">
          ← Voltar para a home
        </Link>
      </div>
    </article>
  );
}
