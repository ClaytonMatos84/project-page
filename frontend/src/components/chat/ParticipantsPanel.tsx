/**
 * Coluna direita (spec `chat-frontend-core`): participantes online da sala —
 * clicar em um nick o seleciona como destinatário automaticamente
 * (`aria-label` "conversar com {nick}"), nick próprio destacado e
 * `aria-live="polite"` no contador de online.
 */
export function ParticipantsPanel({
  participants,
  online,
  ownNick,
  recipient,
  onSelectRecipient,
}: {
  participants: string[];
  online: number;
  ownNick: string | null;
  recipient: string;
  onSelectRecipient: (nick: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">na sala agora</span>
        <span aria-live="polite" className="font-mono text-xs text-muted">
          {online} online
        </span>
      </p>
      <ul className="m-0 flex max-h-[40vh] list-none flex-col gap-0.5 overflow-y-auto p-0 lg:max-h-[calc(100vh-18rem)]">
        {participants.map((p) => {
          const own = p === ownNick;
          const selected = p === recipient;
          return (
            <li key={p}>
              <button
                type="button"
                onClick={() => onSelectRecipient(p)}
                aria-label={`conversar com ${p}`}
                aria-pressed={selected}
                className={`w-full truncate rounded-xs px-2 py-1 text-left text-sm transition-colors active:scale-95 ${
                  own
                    ? 'font-extrabold text-ink'
                    : selected
                      ? 'bg-surface-2 font-bold text-brand-blue-text'
                      : 'text-content hover:bg-surface-2 hover:text-brand-blue-text'
                }`}
              >
                {p}
                {own && <span className="font-normal text-muted"> (você)</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
