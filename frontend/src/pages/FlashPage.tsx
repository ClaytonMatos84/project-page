import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Poll, Reaction, Short } from '@uol/shared';
import { apiFetch, ApiError } from '../lib/api';
import { usePolling } from '../lib/usePolling';
import { hasLiked, likedShortIds, markLiked, markVoted, votedOptions } from '../lib/flashLocal';
import { EmptyState, ErrorState } from '../components/StateViews';
import { ShortFeed } from '../components/flash/ShortFeed';
import { ArticleSheet } from '../components/flash/ArticleSheet';
import { PublishModal } from '../components/flash/PublishModal';
import { Toast } from '../components/flash/Toast';

type SortMode = 'recent' | 'popular';

/**
 * Resposta do polling etiquetada com a visão (sort + epoch) que a originou:
 * respostas obsoletas (toggle/publicação durante o voo) são ignoradas.
 */
interface FeedFetch {
  epoch: number;
  sort: SortMode;
  shorts: Short[];
}

/**
 * Tela imersiva `/flash` (§3.2): moldura de smartphone 9:16, feed vertical
 * com snap, rail de ações, enquete, toggle Recentes/Mais curtidos e polling
 * de 3s com contadores in-place (decisão de design 10).
 */
export function FlashPage() {
  const [sort, setSort] = useState<SortMode>('recent');
  const [reloadKey, setReloadKey] = useState(0);
  const epochRef = useRef(0);
  /** Ordem autoritativa do feed; `null` = a próxima busca válida define a ordem. */
  const orderRef = useRef<string[] | null>(null);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(() => likedShortIds());
  const [votesByShort, setVotesByShort] = useState<Readonly<Record<string, string>>>(() =>
    votedOptions(),
  );
  const [sheetShort, setSheetShort] = useState<Short | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Polling de 3s reusando `usePolling` (cleanup + pausa em document.hidden).
  const { data: fetched, error, loading, refresh } = usePolling<FeedFetch>(
    () => {
      const epoch = epochRef.current;
      return apiFetch<Short[]>(`/api/flash/shorts?sort=${sort}&limit=20`).then((list) => ({
        epoch,
        sort,
        shorts: list,
      }));
    },
    3000,
  );

  /** Ação explícita (toggle/publicação): nova visão; ordem vem da próxima busca. */
  const reorder = useCallback(() => {
    epochRef.current += 1;
    orderRef.current = null;
  }, []);

  const changeSort = (next: SortMode): void => {
    if (next === sort) return;
    reorder();
    setSort(next);
  };

  // Busca imediata após mudança de visão (o fetcher já re-renderizou).
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    refresh();
  }, [sort, reloadKey, refresh]);

  // Merge in-place: contadores atualizam sem reordenar; novos shorts entram no fim.
  useEffect(() => {
    if (!fetched) return;
    if (fetched.epoch !== epochRef.current || fetched.sort !== sort) return;

    if (orderRef.current === null) {
      orderRef.current = fetched.shorts.map((s) => s.id);
      setShorts(fetched.shorts);
      return;
    }
    const byId = new Map(fetched.shorts.map((s) => [s.id, s]));
    const kept = orderRef.current
      .map((id) => byId.get(id))
      .filter((s): s is Short => s !== undefined);
    const known = new Set(orderRef.current);
    const appended = fetched.shorts.filter((s) => !known.has(s.id));
    const next = appended.length > 0 ? [...kept, ...appended] : kept;
    orderRef.current = next.map((s) => s.id);
    setShorts(next);
  }, [fetched, sort]);

  // Mantém o índice visível válido quando o feed encolhe.
  useEffect(() => {
    if (activeIndex > shorts.length - 1) {
      setActiveIndex(Math.max(0, shorts.length - 1));
    }
  }, [shorts.length, activeIndex]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const handleLike = (short: Short): void => {
    if (hasLiked(short.id)) return;
    void (async () => {
      try {
        await apiFetch<Reaction>(`/api/flash/shorts/${short.id}/reactions`, { method: 'POST' });
        markLiked(short.id);
        setLikedIds((prev) => new Set(prev).add(short.id));
        refresh();
      } catch (err) {
        showToast(err instanceof ApiError ? `Erro ao curtir: ${err.message}` : 'Erro ao curtir.');
      }
    })();
  };

  const handleVote = (short: Short, optionId: string): void => {
    if (votesByShort[short.id] !== undefined) return;
    void (async () => {
      try {
        await apiFetch<Poll>(`/api/flash/shorts/${short.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionId }),
        });
        markVoted(short.id, optionId);
        setVotesByShort((prev) => ({ ...prev, [short.id]: optionId }));
        refresh();
      } catch (err) {
        showToast(err instanceof ApiError ? `Erro ao votar: ${err.message}` : 'Erro ao votar.');
      }
    })();
  };

  const handleShare = (short: Short): void => {
    void (async () => {
      const url = short.articleUrl ?? `${window.location.origin}/flash`;
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: short.title, url });
          return; // cancelamento pelo usuário não é erro
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          /* share falhou: cai para o clipboard */
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copiado para a área de transferência.');
      } catch {
        showToast('Não foi possível copiar o link.');
      }
    })();
  };

  const handlePublished = (): void => {
    setPublishOpen(false);
    reorder();
    setSort('recent'); // o short novo aparece no topo do feed Recentes
    setReloadKey((k) => k + 1);
    showToast('Short publicado no feed.');
  };

  const feedBody = () => {
    if (loading && shorts.length === 0) {
      return (
        <div role="status" aria-busy="true" className="h-full w-full">
          <span className="sr-only">Carregando shorts…</span>
          <div className="h-full w-full animate-pulse bg-surface-2" />
        </div>
      );
    }
    if (error && shorts.length === 0) {
      return (
        <div className="h-full w-full overflow-y-auto bg-bg p-4">
          <ErrorState error={error} onRetry={refresh} title="Não foi possível carregar o feed" />
        </div>
      );
    }
    if (!loading && !error && shorts.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-bg p-4">
          <EmptyState
            title="Nenhum short publicado ainda"
            hint="Publique o primeiro short do UOL Flash."
            action={
              <button
                type="button"
                onClick={() => setPublishOpen(true)}
                className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95"
              >
                Publicar o primeiro short
              </button>
            }
          />
        </div>
      );
    }
    return (
      <ShortFeed
        shorts={shorts}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        resetKey={`${sort}-${reloadKey}`}
        likedIds={likedIds}
        votesByShort={votesByShort}
        onLike={handleLike}
        onVote={handleVote}
        onReadArticle={setSheetShort}
        onShare={handleShare}
        onPublish={() => setPublishOpen(true)}
      />
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-bg text-content">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          aria-label="Voltar ao Portal UOL"
          className="text-sm font-semibold text-muted no-underline transition-colors hover:text-content active:scale-95"
        >
          ← Portal UOL
        </Link>
        <span className="text-lg font-extrabold tracking-tight text-ink">
          UOL <span className="text-brand-red">flash short</span>
        </span>
      </header>

      <main className="flex flex-1 justify-center px-4 pb-2">
        <div className="relative aspect-[9/16] h-[85vh] max-h-[820px] max-w-full overflow-hidden rounded-md border border-border bg-black shadow-xl">
          {/* Toggle Recentes / Mais curtidos — materializa a tela Curtidas (§3.2). */}
          <div
            role="group"
            aria-label="Ordenação do feed"
            className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 rounded-full bg-black/70 p-1"
          >
            {(['recent', 'popular'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeSort(mode)}
                aria-pressed={sort === mode}
                className={`rounded-full px-3 py-1 text-xs transition-colors active:scale-95 ${
                  sort === mode
                    ? 'bg-white font-extrabold text-black'
                    : 'font-semibold text-white/80 hover:text-white'
                }`}
              >
                {mode === 'recent' ? 'Recentes' : 'Mais curtidos'}
              </button>
            ))}
          </div>

          {feedBody()}

          {sheetShort && (
            <ArticleSheet short={sheetShort} onClose={() => setSheetShort(null)} />
          )}
        </div>
      </main>

      <p className="m-0 px-4 pb-3 text-center text-xs text-muted">
        Use as setas ↑ e ↓ do teclado para navegar entre os shorts.
      </p>

      <footer className="border-t border-border bg-surface-2 px-6 py-4">
        <p className="m-0 text-center text-xs text-muted">
          Sprint UOL — Frontend &amp; Backend. Layout e identidade visual baseados em{' '}
          <span className="font-telemetry">uol.com.br</span>.
        </p>
      </footer>

      <PublishModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={handlePublished}
      />
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
