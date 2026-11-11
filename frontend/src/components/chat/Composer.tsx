import { useState, type FormEvent } from 'react';
import type { ChatAction } from '@uol/shared';

/** Enum canônico de ações — espelha o `400` do contrato (decisão 6). */
const ACTIONS: ReadonlyArray<ChatAction> = [
  'fala para',
  'grita com',
  'sussurra para',
  'concorda com',
];

const controlClass =
  'rounded-sm border border-border bg-bg px-2.5 py-2 text-sm text-content focus:border-brand-blue';

/**
 * Barra clássica inferior (spec `chat-frontend-core`): seletor de **Ação** +
 * seletor de **Destinatário** (`Todos` + participantes) + checkbox
 * **"Reservadamente"** + texto. `isPrivate` com `Todos` é bloqueado
 * client-side com mensagem inline (espelha o `400`). Enter envia.
 */
export function Composer({
  nick,
  participants,
  action,
  onActionChange,
  recipient,
  onRecipientChange,
  isPrivate,
  onPrivateChange,
  onSend,
  onOpenEnter,
}: {
  nick: string | null;
  participants: string[];
  action: ChatAction;
  onActionChange: (action: ChatAction) => void;
  recipient: string;
  onRecipientChange: (recipient: string) => void;
  isPrivate: boolean;
  onPrivateChange: (isPrivate: boolean) => void;
  /** Resolve `true` quando a mensagem foi enviada (limpa o campo). */
  onSend: (text: string) => Promise<boolean>;
  onOpenEnter: () => void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Sem nick não há presença nem envio (decisão 14).
  if (nick === null) {
    return (
      <div className="border-t border-border bg-surface px-4 py-3">
        <p className="m-0 text-sm text-muted">
          Entre com um apelido para participar da conversa.
        </p>
        <button
          type="button"
          onClick={onOpenEnter}
          className="mt-2 rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95"
        >
          Entrar com apelido
        </button>
      </div>
    );
  }

  const blocked = isPrivate && recipient === 'Todos';

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (sending || blocked) return;
    const trimmed = text.trim();
    if (trimmed === '') return;

    void (async () => {
      setSending(true);
      const sent = await onSend(trimmed);
      if (sent) setText('');
      setSending(false);
    })();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-surface px-3 py-2.5"
      aria-label="Compor mensagem"
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="composer-action">
          Ação
        </label>
        <select
          id="composer-action"
          value={action}
          onChange={(e) => onActionChange(e.target.value as ChatAction)}
          className={`${controlClass} w-32`}
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="composer-recipient">
          Destinatário
        </label>
        <select
          id="composer-recipient"
          value={participants.includes(recipient) || recipient === 'Todos' ? recipient : 'Todos'}
          onChange={(e) => onRecipientChange(e.target.value)}
          className={`${controlClass} max-w-44 flex-1`}
        >
          <option value="Todos">Todos</option>
          {participants.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label
          htmlFor="composer-private"
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-content"
        >
          <input
            id="composer-private"
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => onPrivateChange(e.target.checked)}
            className="h-4 w-4 accent-[var(--uol-blue)]"
          />
          Reservadamente
        </label>

        <label className="sr-only" htmlFor="composer-text">
          Mensagem
        </label>
        <input
          id="composer-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="digite sua mensagem…"
          autoComplete="off"
          className={`${controlClass} min-w-40 flex-1`}
        />

        <button
          type="submit"
          disabled={sending || blocked || text.trim() === ''}
          className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95 disabled:opacity-60"
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
      {blocked && (
        <p role="alert" className="m-0 mt-1.5 text-xs font-semibold text-brand-red">
          Mensagem reservada exige um destinatário específico — escolha um nick em Destinatário.
        </p>
      )}
    </form>
  );
}
