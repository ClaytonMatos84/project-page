import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { Short } from '@uol/shared';
import { ShortCard } from './ShortCard';

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Feed vertical estilo TikTok (spec `flash-frontend-core`):
 * - `snap-y snap-mandatory`, um short por tela, `key={short.id}` estável;
 * - navegação por teclado: setas ↑/↓ rolam com snap (respeitando
 *   `prefers-reduced-motion`);
 * - rastreia o card visível (`activeIndex`) para `aria-live` seletivo.
 */
export function ShortFeed({
  shorts,
  activeIndex,
  onActiveIndexChange,
  resetKey,
  likedIds,
  votesByShort,
  onLike,
  onVote,
  onReadArticle,
  onShare,
  onPublish,
}: {
  shorts: Short[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  /** Muda quando a ordenação muda por ação explícita (toggle/publicação): volta ao topo. */
  resetKey: string;
  /** Dedup por browser: shorts já curtidos (decisão de design 6). */
  likedIds: ReadonlySet<string>;
  /** Dedup por browser: `shortId -> optionId` já votada. */
  votesByShort: Readonly<Record<string, string>>;
  onLike: (short: Short) => void;
  onVote: (short: Short, optionId: string) => void;
  onReadArticle: (short: Short) => void;
  onShare: (short: Short) => void;
  onPublish: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // Reordenação explícita (toggle/publicação): volta ao topo sem remontar cards.
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  const goTo = (index: number): void => {
    const clamped = Math.max(0, Math.min(index, shorts.length - 1));
    const card = cardRefs.current[clamped];
    card?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement;
    if (INTERACTIVE_TAGS.has(target.tagName)) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      goTo(activeIndexRef.current + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      goTo(activeIndexRef.current - 1);
    }
  };

  const handleScroll = (): void => {
    const el = containerRef.current;
    if (!el || el.clientHeight === 0) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    const clamped = Math.max(0, Math.min(index, shorts.length - 1));
    if (clamped !== activeIndexRef.current) onActiveIndexChange(clamped);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Feed de shorts — use as setas para cima e para baixo para navegar"
      className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain outline-none"
    >
      {shorts.map((short, i) => (
        <div
          key={short.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="h-full w-full snap-start"
        >
          <ShortCard
            short={short}
            active={i === activeIndex}
            liked={likedIds.has(short.id)}
            votedOptionId={votesByShort[short.id] ?? null}
            onLike={onLike}
            onVote={onVote}
            onReadArticle={onReadArticle}
            onShare={onShare}
            onPublish={onPublish}
          />
        </div>
      ))}
    </div>
  );
}
