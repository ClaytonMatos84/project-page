import { useEffect, useState, type FormEvent } from 'react';
import type { Room } from '@uol/shared';
import { ApiError } from '../../lib/api';
import { getSavedNick } from '../../lib/chatLocal';
import { useDialog } from '../../lib/useDialog';

/** Regex canônica do apelido — espelha o `400` do contrato (spec `chat-presence`). */
const NICK_REGEX = /^[\w-]{2,24}$/;

const inputClass =
  'w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-content placeholder:text-muted focus:border-brand-blue';

/**
 * Modal de entrada (`Entrada`, §3.3 / decisão 14): apelido obrigatório antes da
 * primeira participação. Validação client-side espelhando o `400`; erro do
 * servidor (apelido em uso) exibido com `role="alert"`; nick persistido em
 * `localStorage` para re-entrada automática. `Esc` fecha (espectador).
 */
export function EnterModal({
  open,
  room,
  currentNick,
  initialError,
  onEnter,
  onClose,
}: {
  open: boolean;
  room: Room | null;
  currentNick: string | null;
  initialError?: string | null;
  /** Rejeita com `ApiError` em falha (o modal exibe); resolve em sucesso. */
  onEnter: (nick: string) => Promise<void>;
  onClose: () => void;
}) {
  const dialogRef = useDialog(open, onClose);
  const [nickValue, setNickValue] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // (Re)abertura: pré-preenche com o nick corrente ou o salvo, limpa erros.
  useEffect(() => {
    if (!open) return;
    setNickValue(currentNick ?? getSavedNick() ?? '');
    setClientError(null);
    setServerError(initialError ?? null);
  }, [open, currentNick, initialError]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (submitting) return;

    setServerError(null);
    const nick = nickValue.trim();
    if (!NICK_REGEX.test(nick)) {
      setClientError('O apelido deve ter de 2 a 24 caracteres (letras, números, _ ou -).');
      return;
    }
    setClientError(null);

    void (async () => {
      setSubmitting(true);
      try {
        await onEnter(nick);
      } catch (err) {
        // Erro do servidor exibido com clareza, nunca engolido (§2.3).
        setServerError(
          err instanceof ApiError ? err.message : 'Não foi possível entrar na sala.',
        );
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enter-title"
        className="w-full max-w-md rounded-md border border-border bg-surface p-5 text-content shadow-2xl"
      >
        <h2 id="enter-title" className="m-0 text-lg font-extrabold text-ink">
          Entrar no bate-papo
        </h2>
        <p className="mt-1 text-sm text-muted">
          {room ? (
            <>
              Sala <strong className="text-ink">{room.name}</strong> — {room.topic}
            </>
          ) : (
            'Carregando as salas…'
          )}
        </p>

        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="enter-nick" className="text-sm font-bold text-ink">
              Seu apelido
            </label>
            <input
              id="enter-nick"
              type="text"
              value={nickValue}
              onChange={(e) => setNickValue(e.target.value)}
              maxLength={24}
              autoComplete="off"
              autoFocus
              placeholder="ex.: visitante_2026"
              aria-describedby={clientError ? 'enter-nick-err' : 'enter-hint'}
              className={inputClass}
            />
            {clientError ? (
              <p id="enter-nick-err" className="m-0 mt-1 text-xs font-semibold text-brand-red">
                {clientError}
              </p>
            ) : (
              <p id="enter-hint" className="m-0 mt-1 text-xs text-muted">
                De 2 a 24 caracteres: letras, números, _ ou -. O apelido é único por sala.
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="m-0 rounded-sm bg-brand-red/10 p-2 text-sm font-semibold text-brand-red">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || room === null}
            className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Entrando…' : room === null ? 'Carregando salas…' : 'Entrar na sala'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-content active:scale-95"
          >
            Continuar sem participar
          </button>
        </form>
      </div>
    </div>
  );
}
