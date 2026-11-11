import { useEffect, useRef } from 'react';
import type { Message, ReactionEmoji } from '@uol/shared';

/** Set canônico com rótulos acessíveis (emojis funcionais, §5.6). */
const REACTIONS: ReadonlyArray<{ emoji: ReactionEmoji; label: string }> = [
  { emoji: '👍', label: 'curtir a mensagem' },
  { emoji: '😂', label: 'rir da mensagem' },
  { emoji: '❤️', label: 'amar a mensagem' },
];

/** Classes de texto por ação (decisão 6): apresentação é da UI, não do servidor. */
function actionTextClass(message: Message): string {
  const base =
    message.action === 'grita com'
      ? 'uppercase font-bold'
      : message.action === 'sussurra para'
        ? 'italic'
        : message.action === 'concorda com'
          ? 'font-semibold'
          : '';
  // Regra dura (§5.1): sobre o amarelo da reservada, o texto é sempre preto.
  const color = message.isPrivate
    ? 'text-black'
    : message.action === 'grita com'
      ? 'text-brand-red-text'
      : message.action === 'sussurra para'
        ? 'text-muted'
        : message.action === 'concorda com'
          ? 'text-brand-blue-text'
          : 'text-content';
  return `${base} ${color}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '--:--:--' : date.toLocaleTimeString('pt-BR');
}

/**
 * Feed da sala (spec `chat-messages` / `chat-frontend-core`): `role="log"`
 * (região live polite implícita), renderização por ação, timestamps em
 * JetBrains Mono, reservadas com fundo amarelo + texto preto + badge, e
 * reações com dedup por browser (`key={message.id}` estável).
 */
export function MessageFeed({
  messages,
  hasReacted,
  onReact,
}: {
  messages: Message[];
  /** Dedup por browser: já reagiu com o emoji a esta mensagem? */
  hasReacted: (messageId: string, emoji: string) => boolean;
  onReact: (message: Message, emoji: ReactionEmoji) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // Mensagens novas entram no fim: acompanha o rodapé do feed.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (messages.length !== prevCountRef.current) {
      prevCountRef.current = messages.length;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-label="Mensagens da sala"
      className="min-h-0 flex-1 overflow-y-auto p-3"
    >
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {messages.map((message) => {
          const onYellow = message.isPrivate;
          return (
            <li
              key={message.id}
              className={`rounded-sm border px-3 py-2 ${
                onYellow
                  ? 'border-black/30 bg-brand-yellow text-black'
                  : 'border-border bg-surface'
              }`}
            >
              <p className="m-0 text-sm leading-relaxed">
                <span
                  className={`font-mono text-xs ${onYellow ? 'text-black/80' : 'text-muted'}`}
                >
                  {formatTime(message.createdAt)}
                </span>{' '}
                <span className={`font-bold ${onYellow ? 'text-black' : 'text-ink'}`}>
                  {message.author}
                </span>{' '}
                <span className={onYellow ? 'text-black/80' : 'text-muted'}>
                  {message.action}
                </span>{' '}
                <span className={`font-semibold ${onYellow ? 'text-black' : 'text-content'}`}>
                  {message.recipient}
                </span>
                {message.isPrivate && (
                  <span className="ml-2 rounded-xs border border-black bg-brand-yellow px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-black">
                    reservada
                  </span>
                )}
              </p>
              <p className={`m-0 mt-1 break-words text-sm ${actionTextClass(message)}`}>
                {message.text}
              </p>
              <div className="mt-1.5 flex gap-1.5">
                {REACTIONS.map(({ emoji, label }) => {
                  const reacted = hasReacted(message.id, emoji);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      disabled={reacted}
                      onClick={() => onReact(message, emoji)}
                      aria-label={`${label}${reacted ? ' (já reagiu)' : ''}`}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors active:scale-95 disabled:cursor-default disabled:opacity-70 ${
                        onYellow
                          ? 'border-black/40 text-black hover:border-black'
                          : 'border-border text-content hover:border-brand-blue'
                      }`}
                    >
                      <span aria-hidden="true">{emoji}</span>
                      <span className="font-mono">{message.reactions[emoji] ?? 0}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
