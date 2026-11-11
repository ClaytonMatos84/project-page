import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type {
  ChatAction,
  EnterResult,
  Message,
  ReactionEmoji,
  Room,
  RoomFeed,
} from '@uol/shared';
import { apiFetch, ApiError } from '../lib/api';
import { usePolling } from '../lib/usePolling';
import { markReacted, reactedKeys, saveNick } from '../lib/chatLocal';
import { EmptyState, ErrorState } from '../components/StateViews';
import { ThemeToggle } from '../components/ThemeToggle';
import { Toast } from '../components/flash/Toast';
import { EnterModal } from '../components/chat/EnterModal';
import { RoomCards } from '../components/chat/RoomCards';
import { RoomList } from '../components/chat/RoomList';
import { MessageFeed } from '../components/chat/MessageFeed';
import { Composer } from '../components/chat/Composer';
import { ParticipantsPanel } from '../components/chat/ParticipantsPanel';

/** Skeleton compacto por região — nunca tela branca (§4.3). */
function RegionSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-2">
      <span className="sr-only">{label}</span>
      <div className="h-14 w-full animate-pulse rounded-sm bg-surface-2" />
      <div className="h-14 w-full animate-pulse rounded-sm bg-surface-2" />
      <div className="h-14 w-full animate-pulse rounded-sm bg-surface-2" />
    </div>
  );
}

/** Barra superior compartilhada pela tela inicial e pela sala (§3.3). */
function ChatTopBar({ onBack }: { onBack: (e: ReactMouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={onBack}
          aria-label="Voltar ao portal UOL"
          className="text-sm font-semibold text-muted no-underline transition-colors hover:text-content active:scale-95"
        >
          ← voltar ao portal
        </Link>
        <span className="text-lg font-extrabold tracking-tight text-ink">
          UOL <span className="text-brand-red">bate-papo</span>
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

/**
 * Tela imersiva `/bate-papo` (§3.3). Abre na **tela inicial de cards** (nenhuma
 * sala é escolhida automaticamente); ao selecionar uma sala, o modal `Entrada`
 * pede o apelido e só então abre a sala em 3 colunas — salas com barra de lotação
 * (esquerda), feed com banner de evento ao vivo + composer clássico (centro),
 * participantes online clicáveis (direita). No mobile as colunas colapsam com o
 * feed prioritário. Dois pollers de 3s com cleanup (§4.2); re-entrada automática
 * ao retomar o foco **apenas na sessão ativa** (nunca após saída explícita).
 */
export function BatePapoPage() {
  const navigate = useNavigate();
  const [nick, setNick] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRoomId, setModalRoomId] = useState<string | null>(null);
  const [enterError, setEnterError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [action, setAction] = useState<ChatAction>('fala para');
  const [recipient, setRecipient] = useState('Todos');
  const [isPrivate, setIsPrivate] = useState(false);
  const [reacted, setReacted] = useState<ReadonlySet<string>>(() => reactedKeys());
  const [roomsOpenMobile, setRoomsOpenMobile] = useState(false);
  const [peopleOpenMobile, setPeopleOpenMobile] = useState(false);

  const showToast = useCallback((message: string) => setToast(message), []);

  // Poller 1 (3s): salas + lotação.
  const roomsPoll = usePolling<Room[]>(() => apiFetch<Room[]>('/api/chat/rooms'), 3000);
  const rooms = roomsPoll.data;
  const activeRoom = rooms?.find((r) => r.id === roomId) ?? null;

  // Poller 2 (3s): feed + participantes piggyback; `?nick=` é o sinal de vida
  // que refresca o TTL de presença (decisão 2/9). Só roda com sala ativa.
  // Guarda a sala a que o feed pertence: uma resposta da sala anterior pode
  // resolver DEPOIS da troca — sem isso, a reentrada por TTL leria um feed
  // velho sem o nick e dispararia um `enter` extra (`400 "Nick already taken"`).
  const feedPoll = usePolling<RoomFeed & { roomId: string } | null>(() => {
    if (roomId === null) return Promise.resolve(null);
    const requestedRoomId = roomId;
    const params = new URLSearchParams({ limit: '50' });
    if (nick !== null) params.set('nick', nick);
    return apiFetch<RoomFeed>(
      `/api/chat/rooms/${requestedRoomId}/messages?${params.toString()}`,
    ).then((snapshot) => ({ ...snapshot, roomId: requestedRoomId }));
  }, 3000);
  const feedSnapshot = feedPoll.data;
  // Descarta feed de sala anterior que resolva após a troca (só a sala corrente vale).
  const feed = feedSnapshot && feedSnapshot.roomId === roomId ? feedSnapshot : null;
  const participants = feed?.participants ?? [];

  // Troca de sala ou entrada: busca imediata com o fetcher já re-renderizado
  // (não espera o próximo tick de 3s).
  useEffect(() => {
    if (roomId !== null) feedPoll.refresh();
  }, [roomId, nick, feedPoll.refresh]);

  const enter = useCallback(
    async (targetRoomId: string, targetNick: string): Promise<EnterResult> =>
      apiFetch<EnterResult>(`/api/chat/rooms/${targetRoomId}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick: targetNick }),
      }),
    [],
  );

  // Saída explícita: remove a presença imediatamente (não espera o TTL).
  const leave = useCallback(
    async (targetRoomId: string, targetNick: string): Promise<EnterResult> =>
      apiFetch<EnterResult>(`/api/chat/rooms/${targetRoomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick: targetNick }),
      }),
    [],
  );

  const openModalFor = useCallback((targetRoomId: string) => {
    setModalRoomId(targetRoomId);
    setEnterError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalRoomId(null);
    setEnterError(null);
  }, []);

  // Janela de dados pré-enter: evita re-entrada falsa sobre feed ainda sem o nick.
  const awaitingPresenceRef = useRef(false);
  // Combo (sala|nick) cuja re-entrada automática já falhou: não fica em loop.
  const autoBlockedComboRef = useRef<string | null>(null);
  // Troca de sala em andamento: suspende a re-entrada automática por TTL.
  const switchingRef = useRef(false);

  /** Entrada vinda do modal (sala selecionada, re-entrada ou troca de apelido). */
  const handleEnter = useCallback(
    async (newNick: string): Promise<void> => {
      const target = modalRoomId ?? roomId;
      if (target === null) {
        throw new ApiError(0, 'INTERNAL', 'Selecione uma sala antes de entrar.');
      }
      // Se já existir presença deste apelido na sala (reload com a mesma sessão
      // ou reentrada imediata), limpa antes de registrar de novo — `/leave` é
      // idempotente e ignora nicks de seed, então o conflito real com apelido
      // de seed continua devolvendo `400` e abrindo o erro no modal.
      await leave(target, newNick);
      await enter(target, newNick);
      saveNick(newNick);
      awaitingPresenceRef.current = true;
      autoBlockedComboRef.current = null;
      setNick(newNick);
      setRoomId(target);
      setLeaveError(null);
      setModalRoomId(null);
      setEnterError(null);
      setModalOpen(false);
      feedPoll.refresh();
      showToast(`Você entrou na sala como ${newNick}.`);
    },
    [modalRoomId, roomId, leave, enter, feedPoll.refresh, showToast],
  );

  /**
   * Troca de sala (coluna esquerda): sai da sala atual (`/leave` imediato, task
   * 5.4) e re-entra na nova com o apelido corrente. Se o apelido estiver em uso
   * lá, abre o modal com o erro para escolher outro.
   */
  const handleSwitchRoom = useCallback(
    (nextRoomId: string): void => {
      if (nextRoomId === roomId || switchingRef.current) return;
      if (nick === null) {
        openModalFor(nextRoomId);
        return;
      }
      const currentRoomId = roomId;
      const currentNick = nick;
      switchingRef.current = true;
      void (async () => {
        try {
          if (currentRoomId !== null) await leave(currentRoomId, currentNick);
          // Limpa presença residual do MESMO apelido na sala de destino (o
          // `/leave` é idempotente) — sem isso, voltar a uma sala onde a
          // sessão anterior ainda não expirou pelo TTL devolveria
          // `400 "Nick already taken"` ao próprio usuário.
          await leave(nextRoomId, currentNick);
          await enter(nextRoomId, currentNick);
          awaitingPresenceRef.current = true;
          autoBlockedComboRef.current = null;
          setRoomId(nextRoomId);
          setRecipient('Todos');
          feedPoll.refresh();
        } catch (err) {
          setEnterError(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível entrar na sala com este apelido.',
          );
          openModalFor(nextRoomId);
        } finally {
          switchingRef.current = false;
        }
      })();
    },
    [roomId, nick, leave, enter, feedPoll.refresh, openModalFor],
  );

  /** Saída explícita: chama `/leave` e volta à tela inicial (task 5.4). */
  const handleLeave = useCallback((): void => {
    if (roomId === null) return;
    const currentRoomId = roomId;
    const currentNick = nick;
    setLeaving(true);
    setLeaveError(null);
    void (async () => {
      try {
        if (currentNick !== null) await leave(currentRoomId, currentNick);
        setRoomId(null);
        setNick(null);
        setAction('fala para');
        setRecipient('Todos');
        setIsPrivate(false);
        setModalOpen(false);
        setModalRoomId(null);
        setEnterError(null);
        showToast('Você saiu da sala.');
      } catch (err) {
        setLeaveError(
          err instanceof ApiError ? err.message : 'Não foi possível sair da sala.',
        );
      } finally {
        setLeaving(false);
      }
    })();
  }, [roomId, nick, leave, showToast]);

  /**
   * Navegação ao portal: se há sessão ativa, sai da sala (`/leave`) antes de
   * navegar; devolve aviso e não simula remoção se a saída falhar.
   */
  const handleBack = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>): void => {
      if (roomId === null || nick === null) return; // deixa o Link navegar
      e.preventDefault();
      const currentRoomId = roomId;
      const currentNick = nick;
      setLeaving(true);
      setLeaveError(null);
      void (async () => {
        try {
          await leave(currentRoomId, currentNick);
          navigate('/');
        } catch (err) {
          setLeaveError(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível sair da sala antes de voltar ao portal.',
          );
          setLeaving(false);
        }
      })();
    },
    [roomId, nick, leave, navigate],
  );

  // Re-entrada automática (spec `chat-presence`): ao retomar o foco depois do
  // TTL expirar (aba ociosa pausa o polling), o nick some de `participants` —
  // o frontend re-entra com o nick salvo. Vale SÓ para a sessão ativa; após
  // saída explícita (`roomId === null`) não há reentrada (task 5.5).
  useEffect(() => {
    if (!feed || nick === null || roomId === null || modalOpen) return;
    if (switchingRef.current) return;
    const combo = `${roomId}|${nick}`;
    if (autoBlockedComboRef.current === combo) return;

    if (feed.participants.includes(nick)) {
      awaitingPresenceRef.current = false;
      return;
    }
    if (awaitingPresenceRef.current) return;

    autoBlockedComboRef.current = combo;
    void (async () => {
      try {
        await enter(roomId, nick);
        autoBlockedComboRef.current = null;
        awaitingPresenceRef.current = true;
        feedPoll.refresh();
      } catch (err) {
        setEnterError(
          err instanceof ApiError ? err.message : 'Não foi possível reentrar na sala.',
        );
        setModalRoomId(roomId);
        setModalOpen(true);
      }
    })();
  }, [feed, nick, roomId, modalOpen, enter, feedPoll.refresh]);

  /** Envio via POST; devolve `true` para o composer limpar o campo. */
  const handleSend = useCallback(
    async (text: string): Promise<boolean> => {
      if (nick === null || roomId === null) return false;
      try {
        await apiFetch<Message>(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author: nick, action, recipient, text, isPrivate }),
        });
        feedPoll.refresh();
        return true;
      } catch (err) {
        showToast(
          err instanceof ApiError ? `Erro ao enviar: ${err.message}` : 'Erro ao enviar mensagem.',
        );
        return false;
      }
    },
    [nick, roomId, action, recipient, isPrivate, feedPoll.refresh, showToast],
  );

  /** Reação com dedup por browser (1 por emoji por mensagem, decisão 7). */
  const handleReact = useCallback(
    (message: Message, emoji: ReactionEmoji): void => {
      const key = `${message.id}:${emoji}`;
      if (reacted.has(key)) return;
      void (async () => {
        try {
          await apiFetch<Message>(`/api/chat/messages/${message.id}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emoji }),
          });
          markReacted(message.id, emoji);
          setReacted((prev) => new Set(prev).add(key));
          feedPoll.refresh();
        } catch (err) {
          showToast(
            err instanceof ApiError ? `Erro ao reagir: ${err.message}` : 'Erro ao reagir.',
          );
        }
      })();
    },
    [reacted, feedPoll.refresh, showToast],
  );

  const hasReactedLocal = useCallback(
    (messageId: string, emoji: string) => reacted.has(`${messageId}:${emoji}`),
    [reacted],
  );

  const modalRoom = rooms?.find((r) => r.id === (modalRoomId ?? roomId)) ?? null;

  // ---- Estados por região (§4.3) ----
  const roomsBody = () => {
    if (roomsPoll.loading && rooms === null) return <RegionSkeleton label="Carregando salas…" />;
    if (roomsPoll.error && rooms === null) {
      return (
        <ErrorState
          error={roomsPoll.error}
          onRetry={roomsPoll.refresh}
          title="Não foi possível carregar as salas"
        />
      );
    }
    if (rooms && rooms.length === 0) {
      return (
        <EmptyState
          title="Nenhuma sala ativa"
          hint="O bate-papo voltou já já — tente novamente em instantes."
        />
      );
    }
    return (
      <RoomList
        rooms={rooms ?? []}
        activeRoomId={roomId}
        nick={nick}
        onSelectRoom={handleSwitchRoom}
        onChangeNick={() => roomId !== null && openModalFor(roomId)}
      />
    );
  };

  const feedLoading = roomId === null || (feedPoll.loading && feed === null);
  const feedFailed = feedPoll.error && feed === null;

  const feedBody = () => {
    if (feedLoading) return <RegionSkeleton label="Carregando mensagens…" />;
    if (feedFailed) {
      return (
        <ErrorState
          error={feedPoll.error}
          onRetry={feedPoll.refresh}
          title="Não foi possível carregar a sala"
        />
      );
    }
    if (feed && feed.messages.length === 0) {
      return (
        <EmptyState
          title="Sala silenciosa"
          hint="Seja o primeiro a falar — o feed atualiza sozinho a cada 3 segundos."
        />
      );
    }
    return (
      <MessageFeed messages={feed?.messages ?? []} hasReacted={hasReactedLocal} onReact={handleReact} />
    );
  };

  const peopleBody = () => {
    if (feedLoading) return <RegionSkeleton label="Carregando participantes…" />;
    if (feedFailed) {
      return (
        <ErrorState
          error={feedPoll.error}
          onRetry={feedPoll.refresh}
          title="Não foi possível carregar os participantes"
        />
      );
    }
    if (participants.length === 0) {
      return <EmptyState title="Ninguém online" hint="A sala está vazia neste momento." />;
    }
    return (
      <ParticipantsPanel
        participants={participants}
        online={participants.length}
        ownNick={nick}
        recipient={recipient}
        onSelectRecipient={setRecipient}
      />
    );
  };

  // Tela inicial: cards das salas, sem entrar automaticamente (task 5.3).
  if (roomId === null) {
    return (
      <div className="flex min-h-full flex-col bg-bg text-content">
        <ChatTopBar onBack={handleBack} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">
            Salas do Bate-Papo
          </h1>
          <p className="mt-1 text-sm text-muted">
            Escolha uma sala para entrar. Você só participa depois de confirmar um apelido.
          </p>
          <div className="mt-5">
            {roomsPoll.loading && rooms === null ? (
              <RegionSkeleton label="Carregando salas…" />
            ) : roomsPoll.error && rooms === null ? (
              <ErrorState
                error={roomsPoll.error}
                onRetry={roomsPoll.refresh}
                title="Não foi possível carregar as salas"
              />
            ) : rooms && rooms.length > 0 ? (
              <RoomCards rooms={rooms} onSelect={openModalFor} />
            ) : (
              <EmptyState
                title="Nenhuma sala ativa"
                hint="O bate-papo voltou já já — tente novamente em instantes."
              />
            )}
          </div>
        </main>
        <footer className="border-t border-border bg-surface-2 px-6 py-4">
          <p className="m-0 text-center text-xs text-muted">
            Sprint UOL — Frontend &amp; Backend. Layout e identidade visual baseados em{' '}
            <span className="font-mono">uol.com.br</span>.
          </p>
        </footer>
        <EnterModal
          open={modalOpen}
          room={modalRoom}
          currentNick={nick}
          initialError={enterError}
          onEnter={handleEnter}
          onClose={closeModal}
        />
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-bg text-content">
      <ChatTopBar onBack={handleBack} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)_230px]">
        {/* Centro: banner ao vivo + feed + composer — prioritário no mobile. */}
        <section
          aria-label="Sala ativa"
          className="order-1 flex min-h-0 flex-col lg:order-2 lg:h-[calc(100vh-11rem)]"
        >
          {activeRoom && (
            <div
              className="mb-3 flex items-center gap-3 rounded-sm border bg-surface px-4 py-2.5"
              style={{ borderColor: activeRoom.color }}
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ background: activeRoom.color }}
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ background: activeRoom.color }}
                />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-muted">
                  ao vivo · {activeRoom.name}
                </p>
                <p className="m-0 truncate text-sm font-bold text-ink">{activeRoom.topic}</p>
              </div>
              <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                {activeRoom.online}/{activeRoom.capacity}
              </span>
              <button
                type="button"
                onClick={handleLeave}
                disabled={leaving}
                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-bold text-content transition-colors hover:border-brand-red hover:text-brand-red active:scale-95 disabled:opacity-60"
              >
                {leaving ? 'saindo…' : 'sair da sala'}
              </button>
            </div>
          )}

          {leaveError && (
            <div
              role="alert"
              className="mb-3 flex items-center justify-between gap-3 rounded-sm border border-brand-red bg-surface px-3 py-2"
            >
              <span className="text-sm font-semibold text-brand-red">{leaveError}</span>
              <button
                type="button"
                onClick={handleLeave}
                className="shrink-0 rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white active:scale-95"
              >
                tentar novamente
              </button>
            </div>
          )}

          <div className="flex min-h-[50vh] flex-1 flex-col overflow-hidden rounded-sm border border-border bg-surface lg:min-h-0">
            {feedBody()}
            <Composer
              nick={nick}
              participants={participants}
              action={action}
              onActionChange={setAction}
              recipient={recipient}
              onRecipientChange={setRecipient}
              isPrivate={isPrivate}
              onPrivateChange={setIsPrivate}
              onSend={handleSend}
              onOpenEnter={() => roomId !== null && openModalFor(roomId)}
            />
          </div>
        </section>

        {/* Esquerda: salas + lotação — colapsável no mobile. */}
        <section aria-label="Salas" className="order-2 lg:order-1">
          <button
            type="button"
            onClick={() => setRoomsOpenMobile((v) => !v)}
            aria-expanded={roomsOpenMobile}
            aria-controls="chat-rooms-panel"
            className="flex w-full items-center justify-between rounded-sm border border-border bg-surface px-3 py-2 text-sm font-bold text-ink transition-colors active:scale-95 lg:hidden"
          >
            Salas e lotação
            <span aria-hidden="true">{roomsOpenMobile ? '▴' : '▾'}</span>
          </button>
          <div
            id="chat-rooms-panel"
            className={`${roomsOpenMobile ? 'block' : 'hidden'} mt-2 lg:mt-0 lg:block`}
          >
            {roomsBody()}
          </div>
        </section>

        {/* Direita: participantes — colapsável no mobile. */}
        <section aria-label="Participantes" className="order-3">
          <button
            type="button"
            onClick={() => setPeopleOpenMobile((v) => !v)}
            aria-expanded={peopleOpenMobile}
            aria-controls="chat-people-panel"
            className="flex w-full items-center justify-between rounded-sm border border-border bg-surface px-3 py-2 text-sm font-bold text-ink transition-colors active:scale-95 lg:hidden"
          >
            Quem está online
            <span aria-hidden="true">{peopleOpenMobile ? '▴' : '▾'}</span>
          </button>
          <div
            id="chat-people-panel"
            className={`${peopleOpenMobile ? 'block' : 'hidden'} mt-2 lg:mt-0 lg:block`}
          >
            {peopleBody()}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface-2 px-6 py-4">
        <p className="m-0 text-center text-xs text-muted">
          Sprint UOL — Frontend &amp; Backend. Layout e identidade visual baseados em{' '}
          <span className="font-mono">uol.com.br</span>.
        </p>
      </footer>

      <EnterModal
        open={modalOpen}
        room={modalRoom}
        currentNick={nick}
        initialError={enterError}
        onEnter={handleEnter}
        onClose={closeModal}
      />
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
