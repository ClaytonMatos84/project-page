/**
 * Entidades base do domínio UOL (§3) — contrato compartilhado.
 *
 * SOMENTE LEITURA para as tracks B/C. Alteração exige nova spec (Track A).
 */

/** Editoria fixa desta sprint (§5.2) — as cinco canônicas. */
export type EditoriaSlug =
  | 'noticias'
  | 'esportes'
  | 'economia'
  | 'entretenimento'
  | 'tecnologia';

/** Produto ao qual a entidade pertence. */
export type Product = 'mini-portal' | 'flash-short' | 'chat';

export interface Editoria {
  id: string;
  name: string;
  slug: EditoriaSlug;
  color: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  editoria: EditoriaSlug;
  publishedAt: string;
  imageUrl: string;
  url: string;
}

export interface Highlight {
  articleId: string;
  position: number;
  label: string;
}

/**
 * Destaque da home já resolvido com o `article` embutido.
 * Forma retornada por `GET /api/portal/highlights` — evita N+1 no cliente.
 */
export interface HighlightWithArticle extends Highlight {
  article: Article;
}

/** Tipo de mídia vertical do short (§3.2). */
export type ShortMediaType = 'image' | 'video';

/** Opção de enquete embutida no short (capability `flash-polls`). */
export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

/** Enquete embutida no short — evita N+1 no feed (flash-polls). */
export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface Short {
  id: string;
  title: string;
  body: string;
  durationMs: number;
  editoria: EditoriaSlug;
  reactions: number;
  createdAt: string;
  /** Mídia vertical de fundo do card (seed: picsum `720/1280`). */
  mediaUrl: string;
  /** Tipo da mídia — `image` ou `video`. */
  mediaType: ShortMediaType;
  /** Link da matéria completa; botão "Ler Matéria Completa" é condicional a ele. */
  articleUrl?: string;
  /** Enquete opcional embutida (decisão de design: evita N+1). */
  poll?: Poll;
}

export interface Reaction {
  shortId: string;
  count: number;
  updatedAt: string;
}

/**
 * Ações canônicas do Bate-Papo UOL clássico (§3.3 / decisão de design 6).
 * O servidor NÃO transforma o texto — a renderização (caixa alta, itálico) é da UI.
 */
export type ChatAction = 'fala para' | 'grita com' | 'sussurra para' | 'concorda com';

/** Set canônico de reações por mensagem (decisão de design 7). */
export type ReactionEmoji = '👍' | '😂' | '❤️';

export interface Room {
  id: string;
  name: string;
  /** Evento ao vivo em destaque no banner da sala. */
  topic: string;
  online: number;
  /** Lotação da sala — visual-only (decisão de design 8: sem `400 ROOM_FULL`). */
  capacity: number;
  /** Acento de editoria da sala (§5.2). */
  color: string;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  author: string;
  action: ChatAction;
  /** `Todos` ou nick presente na sala. */
  recipient: string;
  text: string;
  /** Reservada: filtrada no servidor — só o par autor/destinatário a vê. */
  isPrivate: boolean;
  /** Contadores por emoji do set canônico (`ReactionEmoji` -> total). */
  reactions: Record<string, number>;
  createdAt: string;
}

/** Presença por apelido (decisão de design 2): TTL de 10s refrescado pelo polling. */
export interface Presence {
  roomId: string;
  nick: string;
  lastSeenAt: string;
}

/** Resposta do `POST /api/chat/rooms/:id/enter`. */
export interface EnterResult {
  roomId: string;
  nick: string;
  online: number;
  participants: string[];
}

/**
 * Resposta do `GET /api/chat/rooms/:id/messages` — participantes piggyback
 * (decisão de design 9): um único poll dirige o feed e a lista de nicks.
 */
export interface RoomFeed {
  messages: Message[];
  participants: string[];
}
