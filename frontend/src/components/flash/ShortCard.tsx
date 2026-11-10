import { useEffect, useRef, useState } from 'react';
import type { Short } from '@uol/shared';
import { editoriaColorVar, editoriaOnColor } from '../../lib/editorias';
import { ActionRail } from './ActionRail';
import { PollCard } from './PollCard';

/** Badge de tempo de leitura (`durationMs`) em JetBrains Mono (§5.3). */
function durationLabel(durationMs: number): string {
  const seconds = Math.max(1, Math.round(durationMs / 1000));
  return `${seconds}s`;
}

/**
 * Card do short: mídia vertical de fundo (com `onError` → fallback na cor da
 * editoria), chip de editoria no token, badge `durationMs`, título + resumo
 * com scrim para contraste AA. Vídeo: `muted` + `playsInline` + pausa via
 * IntersectionObserver fora da viewport (decisão de design 11).
 */
export function ShortCard({
  short,
  active,
  liked,
  votedOptionId,
  onLike,
  onVote,
  onReadArticle,
  onShare,
  onPublish,
}: {
  short: Short;
  active: boolean;
  liked: boolean;
  votedOptionId: string | null;
  onLike: (short: Short) => void;
  onVote: (short: Short, optionId: string) => void;
  onReadArticle: (short: Short) => void;
  onShare: (short: Short) => void;
  onPublish: () => void;
}) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Vídeo pausa quando sai da viewport (a11y/banda — decisão de design 11).
  useEffect(() => {
    if (short.mediaType !== 'video') return;
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [short.mediaType]);

  return (
    <article
      aria-label={short.title}
      className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-black"
    >
      {/* Mídia de fundo — fallback na cor da editoria em erro (nunca tela branca). */}
      {mediaFailed ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: editoriaColorVar(short.editoria) }}
        />
      ) : short.mediaType === 'video' ? (
        <video
          ref={videoRef}
          src={short.mediaUrl}
          muted
          playsInline
          loop
          preload="metadata"
          onError={() => setMediaFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          src={short.mediaUrl}
          alt=""
          aria-hidden="true"
          onError={() => setMediaFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}

      {/* Scrim inferior: contraste AA do texto sobre a mídia (§4.3). */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
      />

      {/* Conteúdo sobre a mídia. */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold"
            style={{
              backgroundColor: editoriaColorVar(short.editoria),
              color: editoriaOnColor(short.editoria),
            }}
          >
            {short.editoria}
          </span>
          <span className="font-telemetry rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
            {durationLabel(short.durationMs)}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex max-w-[calc(100%-3.5rem)] flex-col gap-3">
            {short.poll && (
              <PollCard
                short={short}
                active={active}
                votedOptionId={votedOptionId}
                onVote={onVote}
              />
            )}
            <div>
              <h2 className="m-0 text-lg font-extrabold leading-tight text-white">
                {short.title}
              </h2>
              <p className="mt-1 line-clamp-3 text-sm text-white/90">{short.body}</p>
            </div>
          </div>
        </div>
      </div>

      <ActionRail
        short={short}
        active={active}
        liked={liked}
        onLike={onLike}
        onReadArticle={onReadArticle}
        onShare={onShare}
        onPublish={onPublish}
      />
    </article>
  );
}
