/**
 * Persistência do bate-papo por browser (decisões 2/3/7):
 * - apelido salvo para re-entrada automática ao retomar o foco (TTL de presença);
 * - dedup de reações: 1 por emoji por mensagem por browser (o contrato apenas
 *   incrementa — a trava é client-side, precedente do flash).
 */

const NICK_KEY = 'uol-chat-nick';
const REACT_PREFIX = 'uol-chat-react:';

function readKey(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* localStorage indisponível: segue sem persistência */
  }
}

/** Apelido salvo neste browser (ou `null`). */
export function getSavedNick(): string | null {
  return readKey(NICK_KEY);
}

/** Persiste o apelido para re-entrada automática. */
export function saveNick(nick: string): void {
  writeKey(NICK_KEY, nick);
}

/** Já reagiu com este emoji a esta mensagem neste browser? */
export function hasReacted(messageId: string, emoji: string): boolean {
  return readKey(`${REACT_PREFIX}${messageId}:${emoji}`) !== null;
}

/** Registra a reação (dedup por browser). */
export function markReacted(messageId: string, emoji: string): void {
  writeKey(`${REACT_PREFIX}${messageId}:${emoji}`, new Date().toISOString());
}

/** Todas as reações deste browser como `${messageId}:${emoji}` (hidratação inicial). */
export function reactedKeys(): Set<string> {
  const keys = new Set<string>();
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(REACT_PREFIX)) keys.add(key.slice(REACT_PREFIX.length));
    }
  } catch {
    /* localStorage indisponível */
  }
  return keys;
}
