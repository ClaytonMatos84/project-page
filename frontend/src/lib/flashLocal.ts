/**
 * Dedup por browser (decisão de design 6): sem autenticação no sistema, o
 * frontend guarda 1 curtida + 1 voto por short por browser em `localStorage`.
 * O contrato apenas incrementa — a trava é client-side.
 */

const LIKE_PREFIX = 'uol-flash-like:';
const VOTE_PREFIX = 'uol-flash-vote:';

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
    /* localStorage indisponível: dedup falha silencioso, contrato segue puro */
  }
}

/** Já curtiu este short neste browser? */
export function hasLiked(shortId: string): boolean {
  return readKey(`${LIKE_PREFIX}${shortId}`) !== null;
}

/** Registra a curtida do short neste browser. */
export function markLiked(shortId: string): void {
  writeKey(`${LIKE_PREFIX}${shortId}`, new Date().toISOString());
}

/** Opção votada neste browser para o short (ou `null` se não votou). */
export function getVotedOption(shortId: string): string | null {
  return readKey(`${VOTE_PREFIX}${shortId}`);
}

/** Registra o voto do short neste browser. */
export function markVoted(shortId: string, optionId: string): void {
  writeKey(`${VOTE_PREFIX}${shortId}`, optionId);
}

/** Todos os shorts curtidos neste browser (hidratação inicial do estado). */
export function likedShortIds(): Set<string> {
  const ids = new Set<string>();
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(LIKE_PREFIX)) ids.add(key.slice(LIKE_PREFIX.length));
    }
  } catch {
    /* localStorage indisponível */
  }
  return ids;
}

/** Todos os votos deste browser: `shortId -> optionId` (hidratação inicial). */
export function votedOptions(): Record<string, string> {
  const votes: Record<string, string> = {};
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(VOTE_PREFIX)) {
        const optionId = window.localStorage.getItem(key);
        if (optionId) votes[key.slice(VOTE_PREFIX.length)] = optionId;
      }
    }
  } catch {
    /* localStorage indisponível */
  }
  return votes;
}
