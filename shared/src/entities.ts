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

export interface Room {
  id: string;
  name: string;
  topic: string;
  online: number;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Presence {
  roomId: string;
  online: number;
  updatedAt: string;
}
