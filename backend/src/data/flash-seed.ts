import type { EditoriaSlug, Poll, Reaction, Short, ShortMediaType } from '@uol/shared';

/**
 * Seed em memória do UOL Flash Short (§2.1 / §3.2).
 *
 * 6 shorts do universo UOL com mídia vertical (picsum `720/1280`), `articleUrl`,
 * `durationMs` derivado e enquete embutida — cobrindo as 5 editorias canônicas.
 * Mutável em runtime: reação, voto e publicação alteram a base (perde-se no restart, by design).
 */

const img = (seed: string): string => `https://picsum.photos/seed/${seed}/720/1280`;

/**
 * Deriva o tempo de leitura estimado (`durationMs`) a partir do `body`
 * (decisão de design 8): ~200 palavras/minuto, mínimo de 4s, arredondado ao segundo.
 */
export function deriveDurationMs(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4_000, Math.round((words * 300) / 1000) * 1000);
}

interface PollDraft {
  question: string;
  options: string[];
  votes: number[];
}

interface ShortDraft {
  title: string;
  body: string;
  editoria: EditoriaSlug;
  createdAt: string;
  reactions: number;
  articleUrl: string;
  mediaType?: ShortMediaType;
  poll?: PollDraft;
}

const drafts: ShortDraft[] = [
  {
    title: 'Brasileirão: rodada define confrontos diretos na briga pelo título',
    body: 'Times de cima da tabela se enfrentam neste fim de semana e a rodada pode mudar o rumo da competição.',
    editoria: 'esportes',
    createdAt: '2026-11-10T09:00:00.000Z',
    reactions: 128,
    articleUrl: 'https://uol.com.br/esportes/brasileirao-rodada-decisiva',
    poll: {
      question: 'Você acompanhou o jogo?',
      options: ['Sim, do início ao fim', 'Só o segundo tempo'],
      votes: [12, 8],
    },
  },
  {
    title: 'Inflação desacelera e mercado revisa projeções',
    body: 'Terceira queda consecutiva é puxada por alimentos e combustíveis, aliviando o bolso das famílias.',
    editoria: 'economia',
    createdAt: '2026-11-10T08:30:00.000Z',
    reactions: 89,
    articleUrl: 'https://uol.com.br/economia/inflacao-desacelera',
    poll: {
      question: 'Você sentiu a queda nos preços?',
      options: ['Sim, no supermercado', 'Ainda não', 'Só nos combustíveis'],
      votes: [22, 31, 9],
    },
  },
  {
    title: 'Empresas aceleram adoção de inteligência artificial no atendimento',
    body: 'Assistentes virtuais reduzem filas e melhoram a resolução de chamados em grandes operadoras.',
    editoria: 'tecnologia',
    createdAt: '2026-11-10T08:00:00.000Z',
    reactions: 210,
    articleUrl: 'https://uol.com.br/tecnologia/ia-no-atendimento',
    poll: {
      question: 'Você já foi atendido por uma IA?',
      options: ['Sim, e resolveu', 'Sim, mas não resolveu', 'Nunca passei por isso'],
      votes: [48, 17, 25],
    },
  },
  {
    title: 'Festival de música anuncia line-up com atrações nacionais',
    body: 'Evento ocupa três palcos, reúne atrações de peso e deve bater recorde de público no fim de semana.',
    editoria: 'entretenimento',
    createdAt: '2026-11-10T07:30:00.000Z',
    reactions: 45,
    articleUrl: 'https://uol.com.br/entretenimento/festival-lineup',
    poll: {
      question: 'Você vai ao festival?',
      options: ['Sim, já garanti o ingresso', 'Não', 'Ainda estou em dúvida'],
      votes: [14, 19, 7],
    },
  },
  {
    title: 'Chuvas de novembro deixam cidades em alerta no Sudeste',
    body: 'Defesa Civil orienta moradores de áreas de risco e monitora o nível dos rios após a frente fria.',
    editoria: 'noticias',
    createdAt: '2026-11-10T07:00:00.000Z',
    reactions: 67,
    articleUrl: 'https://uol.com.br/noticias/chuvas-alerta-sudeste',
    poll: {
      question: 'Sua cidade foi afetada pelas chuvas?',
      options: ['Sim', 'Não'],
      votes: [11, 26],
    },
  },
  {
    // Sem enquete de propósito: exercita o `400` de voto em short sem enquete (QA 4.3).
    title: 'Seleção convoca reforços para as próximas eliminatórias',
    body: 'Treinador aposta em jovens para dar velocidade ao setor ofensivo nas duas próximas rodadas.',
    editoria: 'esportes',
    createdAt: '2026-11-10T06:30:00.000Z',
    reactions: 12,
    articleUrl: 'https://uol.com.br/esportes/selecao-convocacao',
  },
];

function buildPoll(draft: PollDraft): Poll {
  const options = draft.options.map((label, i) => ({
    id: `opt-${i + 1}`,
    label,
    votes: draft.votes[i] ?? 0,
  }));
  return {
    question: draft.question,
    options,
    totalVotes: options.reduce((acc, o) => acc + o.votes, 0),
  };
}

/** Base mutável em memória — o `id` é sequencial e estável por boot. */
const shorts: Short[] = drafts.map((d, i) => {
  const id = `short-${i + 1}`;
  return {
    id,
    title: d.title,
    body: d.body,
    durationMs: deriveDurationMs(d.body),
    editoria: d.editoria,
    reactions: d.reactions,
    createdAt: d.createdAt,
    mediaUrl: img(`uol-short-${i + 1}`),
    mediaType: d.mediaType ?? 'image',
    articleUrl: d.articleUrl,
    ...(d.poll ? { poll: buildPoll(d.poll) } : {}),
  };
});

const byId = new Map(shorts.map((s) => [s.id, s]));
let nextId = shorts.length + 1;

export type ShortSort = 'recent' | 'popular';

/** Lista shorts ordenados por `sort` (`recent` = `createdAt` desc, `popular` = `reactions` desc). */
export function listShorts(sort: ShortSort, limit: number): Short[] {
  const sorted = shorts.slice().sort((a, b) =>
    sort === 'popular'
      ? b.reactions - a.reactions
      : Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  return sorted.slice(0, limit);
}

/** Busca um short por `id` na base em memória. */
export function findShort(id: string): Short | undefined {
  return byId.get(id);
}

/** Incrementa a contagem de reações e devolve a entidade `Reaction` atualizada. */
export function addReaction(id: string): Reaction | undefined {
  const short = byId.get(id);
  if (!short) return undefined;
  short.reactions += 1;
  return { shortId: short.id, count: short.reactions, updatedAt: new Date().toISOString() };
}

/** Incrementa o voto de uma opção da enquete; devolve o `poll` atualizado. */
export type VoteResult = Poll | 'no-poll' | 'bad-option';

export function addVote(id: string, optionId: string): VoteResult | undefined {
  const short = byId.get(id);
  if (!short) return undefined;
  if (!short.poll) return 'no-poll';
  const option = short.poll.options.find((o) => o.id === optionId);
  if (!option) return 'bad-option';
  option.votes += 1;
  short.poll.totalVotes += 1;
  return short.poll;
}

/** Payload já validado para criação de short (validação vive na rota). */
export interface CreateShortInput {
  title: string;
  body: string;
  editoria: EditoriaSlug;
  mediaUrl: string;
  mediaType: ShortMediaType;
  articleUrl?: string;
  poll?: { question: string; options: string[] };
}

/** Cria um short novo na base: `reactions: 0`, `createdAt` agora, `durationMs` derivado. */
export function createShort(input: CreateShortInput): Short {
  const id = `short-${nextId}`;
  nextId += 1;

  const short: Short = {
    id,
    title: input.title,
    body: input.body,
    durationMs: deriveDurationMs(input.body),
    editoria: input.editoria,
    reactions: 0,
    createdAt: new Date().toISOString(),
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
    ...(input.articleUrl ? { articleUrl: input.articleUrl } : {}),
    ...(input.poll
      ? {
          poll: {
            question: input.poll.question,
            options: input.poll.options.map((label, i) => ({
              id: `opt-${i + 1}`,
              label,
              votes: 0,
            })),
            totalVotes: 0,
          },
        }
      : {}),
  };

  shorts.unshift(short);
  byId.set(short.id, short);
  return short;
}
