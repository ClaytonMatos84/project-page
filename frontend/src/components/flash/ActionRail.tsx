import type { Short } from '@uol/shared';
import { editoriaColorVar } from '../../lib/editorias';
import { ArticleIcon, HeartIcon, PlusIcon, ShareIcon } from './Icons';

/**
 * Rail de ações flutuante à direita do card atual (spec `flash-frontend-core`):
 * Curtir (dedup `localStorage` + contador), Ler Matéria Completa (bottom sheet,
 * condicional a `articleUrl`), Compartilhar (`navigator.share` → fallback
 * clipboard + toast) e Publicar (abre modal).
 */
export function ActionRail({
  short,
  active,
  liked,
  onLike,
  onReadArticle,
  onShare,
  onPublish,
}: {
  short: Short;
  active: boolean;
  liked: boolean;
  onLike: (short: Short) => void;
  onReadArticle: (short: Short) => void;
  onShare: (short: Short) => void;
  onPublish: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-28 right-3 z-20 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => onLike(short)}
          disabled={liked}
          aria-label={liked ? `Short já curtido (${short.reactions} curtidas)` : `Curtir: ${short.title} (${short.reactions} curtidas)`}
          aria-pressed={liked}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:bg-black/80 active:scale-95 disabled:cursor-not-allowed"
          style={liked ? { color: editoriaColorVar(short.editoria) } : undefined}
        >
          <HeartIcon className="h-6 w-6" fill={liked ? 'currentColor' : 'none'} />
        </button>
        <span
          aria-live={active ? 'polite' : 'off'}
          className="font-telemetry mt-0.5 text-xs font-bold text-white"
        >
          {short.reactions}
          <span className="sr-only"> curtidas</span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => onShare(short)}
        aria-label={`Compartilhar: ${short.title}`}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:bg-black/80 active:scale-95"
      >
        <ShareIcon className="h-5 w-5" />
      </button>

      {short.articleUrl && (
        <button
          type="button"
          onClick={() => onReadArticle(short)}
          aria-label={`Ler matéria completa: ${short.title}`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:bg-black/80 active:scale-95"
        >
          <ArticleIcon className="h-5 w-5" />
        </button>
      )}

      <button
        type="button"
        onClick={onPublish}
        aria-label="Publicar novo short"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-sm font-extrabold transition-transform active:scale-95"
        style={{
          backgroundColor: 'var(--uol-yellow)',
          color: '#000000', /* regra dura: amarelo sempre com texto preto (§5.1) */
        }}
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
