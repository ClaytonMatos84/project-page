import type {
  ChatAction,
  EnterResult,
  Message,
  ReactionEmoji,
  Room,
  RoomFeed,
} from '@uol/shared';

/**
 * Seed em memória do Bate-Papo UOL Next-Gen (§2.1 / §3.3).
 *
 * 4 salas temáticas com tópico ao vivo, lotação (visual-only, decisão 8), nicks
 * de época e histórico inicial exercitando as 4 ações canônicas, mensagens
 * reservadas de terceiros (para o filtro do `?nick=` na QA) e reações
 * pré-contadas. Mutável em runtime: entrada, envio e reação alteram a base
 * (perde-se no restart, by design §2.1).
 *
 * Presença por TTL (decisão 2): `enter` registra `lastSeenAt`; o polling de
 * mensagens com `?nick=` é o sinal de vida; varredura preguiçosa no read path
 * remove apelidos silenciosos há mais de 10s. Nicks de seed são permanentes —
 * a lotação ("35/40") é parte do seed (decisão 8) e não evapora.
 */

/** Regex canônica do apelido (spec `chat-presence`). */
export const NICK_REGEX = /^[\w-]{2,24}$/;

/** Enum canônico de ações (decisão 6). */
export const CHAT_ACTIONS: readonly ChatAction[] = [
  'fala para',
  'grita com',
  'sussurra para',
  'concorda com',
];

/** Set canônico de reações (decisão 7). */
export const REACTION_EMOJIS: readonly ReactionEmoji[] = ['👍', '😂', '❤️'];

/** TTL de presença: apelido sem sinal de vida há mais de 10s sai da sala. */
export const PRESENCE_TTL_MS = 10_000;

/** Limite default do feed (decisão 11) e teto. */
export const DEFAULT_FEED_LIMIT = 50;
export const MAX_FEED_LIMIT = 200;

/** Presença interna: `seed: true` marca nicks permanentes do seed. */
interface PresenceEntry {
  nick: string;
  lastSeenAt: string;
  seed: boolean;
}

/** Estado mutável de uma sala em memória. */
export interface ChatRoomState {
  meta: Omit<Room, 'online'>;
  presence: PresenceEntry[];
  messages: Message[];
}

/** Rascunho de mensagem do seed — reações na ordem [👍, 😂, ❤️]. */
interface MessageDraft {
  author: string;
  action: ChatAction;
  recipient: string;
  text: string;
  isPrivate: boolean;
  reactions: [number, number, number];
}

interface RoomDraft {
  id: string;
  name: string;
  topic: string;
  color: string;
  nicks: string[];
  messages: MessageDraft[];
}

const ROOMS: RoomDraft[] = [
  {
    id: 'arquibancada',
    name: 'Arquibancada Esporte',
    topic: 'Debate da rodada: quem leva o título?',
    color: '#005FFF',
    nicks: [
      'palmeiras_10', 'corintiano_77', 'tricolor_do_povo', 'flamenguista_rj',
      'vascaino_1976', 'cruzeirense_mg', 'gremio_do_pampa', 'colorado_rs',
      'santista_peixe', 'furacao_fiel', 'galo_doido', 'raposa_mineira',
      'leao_do_norte', 'bahea_forte', 'timbu_nautico', 'leao_da_ilha',
      'alvinegro_ceara', 'fortaleza_tricolor', 'esmeralda_goiano', 'bugre_guarani',
      'gl_botafogo', 'lusa_portuguesa', 'juventude_rs', 'tigre_criciuma',
      'chape_fiel', 'avai_leao', 'figueira_fusca', 'parana_tubarao',
      'vila_tigre', 'crb_regata', 'csa_azulao', 'confianca_se',
      'botafogo_sp', 'inter_de_limeira', 'novo_hamburgo_rs',
    ],
    messages: [
      {
        author: 'palmeiras_10',
        action: 'fala para',
        recipient: 'Todos',
        text: 'galera, quem leva o título esse ano? eu aposto no verdão',
        isPrivate: false,
        reactions: [4, 1, 0],
      },
      {
        author: 'corintiano_77',
        action: 'grita com',
        recipient: 'Todos',
        text: 'é o timão!!! sempre ele!!!',
        isPrivate: false,
        reactions: [2, 5, 1],
      },
      {
        author: 'tricolor_do_povo',
        action: 'concorda com',
        recipient: 'palmeiras_10',
        text: 'por isso mesmo, o nosso tricolor é o mais consistente da temporada',
        isPrivate: false,
        reactions: [3, 0, 0],
      },
      {
        author: 'flamenguista_rj',
        action: 'sussurra para',
        recipient: 'Todos',
        text: 'psst... o árbitro tá mal hoje, né?',
        isPrivate: false,
        reactions: [1, 2, 0],
      },
      {
        author: 'gremio_do_pampa',
        action: 'fala para',
        recipient: 'colorado_rs',
        text: 'clássico no fim de semana, vai ser guerra no Beira-Rio',
        isPrivate: false,
        reactions: [2, 0, 1],
      },
      {
        // Reservada entre terceiros: exercita o filtro do `?nick=` (QA 4.5).
        author: 'vascaino_1976',
        action: 'sussurra para',
        recipient: 'cruzeirense_mg',
        text: 'depois do jogo a gente se encontra lá no paquera',
        isPrivate: true,
        reactions: [0, 0, 0],
      },
      {
        author: 'santista_peixe',
        action: 'grita com',
        recipient: 'flamenguista_rj',
        text: 'respeita o peixe!!! 1935 não se discute!!!',
        isPrivate: false,
        reactions: [3, 4, 0],
      },
      {
        author: 'colorado_rs',
        action: 'concorda com',
        recipient: 'corintiano_77',
        text: 'grito é com o coração, mas título é com a tabela',
        isPrivate: false,
        reactions: [1, 1, 0],
      },
    ],
  },
  {
    id: 'devs-opencode',
    name: 'Devs & OpenCode',
    topic: 'Ao vivo: agents escrevendo specs',
    color: '#6A1B9A',
    nicks: [
      'orchestrator', 'spec_architect', 'backend_dev', 'frontend_dev',
      'ui_art_director', 'code_reviewer', 'qa_demo', 'ts_strict',
      'node_ninja', 'regex_guru', 'yaml_wizard', 'vim_master',
    ],
    messages: [
      {
        author: 'spec_architect',
        action: 'fala para',
        recipient: 'Todos',
        text: 'specs validadas com --strict, contrato congelado pra todas as tracks',
        isPrivate: false,
        reactions: [6, 0, 2],
      },
      {
        author: 'backend_dev',
        action: 'grita com',
        recipient: 'Todos',
        text: 'o envelope é sagrado!!! data null em erro, sempre!!!',
        isPrivate: false,
        reactions: [4, 2, 0],
      },
      {
        // Reservada entre terceiros (QA 4.5).
        author: 'frontend_dev',
        action: 'sussurra para',
        recipient: 'ui_art_director',
        text: 'esse amarelo com texto preto ficou impecável, não conta pro reviewer',
        isPrivate: true,
        reactions: [0, 0, 0],
      },
      {
        author: 'code_reviewer',
        action: 'concorda com',
        recipient: 'spec_architect',
        text: 'validar --strict evita 80% dos blockers antes do código',
        isPrivate: false,
        reactions: [5, 0, 1],
      },
      {
        author: 'qa_demo',
        action: 'fala para',
        recipient: 'Todos',
        text: 'smoke verde, demo marcada, evidências publicadas',
        isPrivate: false,
        reactions: [3, 1, 0],
      },
      {
        author: 'ts_strict',
        action: 'grita com',
        recipient: 'node_ninja',
        text: 'any implícito nunca mais!!!',
        isPrivate: false,
        reactions: [2, 3, 0],
      },
      {
        author: 'orchestrator',
        action: 'fala para',
        recipient: 'Todos',
        text: 'tracks em paralelo agora, convergência antes do fechamento',
        isPrivate: false,
        reactions: [4, 0, 3],
      },
    ],
  },
  {
    id: 'paquera',
    name: 'Paquera SP',
    topic: 'Ao vivo: paquera e resenhas na capital',
    color: '#ED5709',
    nicks: [
      'gata_sp_98', 'romantico_sp', 'solitaria_99', 'morena_paulista',
      'loirinha_sp', 'brunete_sp', 'tigresa_zona_norte', 'paulistano_71',
      'sp_coracao', 'caipira_sp', 'cafezinho_zs', 'baladeiro_90',
      'noturna_sp', 'friero_sp', 'gatinho_zona_leste', 'solteiro_sp',
      'coracao_mg', 'afinadora', 'doce_paulista', 'estrela_sp',
      'picante_zona_norte', 'charme_sp', 'parque_ibirapuera', 'saudade_90',
      'serenata_sp', 'lua_de_mel', 'flerte_sutil',
    ],
    messages: [
      {
        author: 'gata_sp_98',
        action: 'fala para',
        recipient: 'Todos',
        text: 'oi galera, alguém de SP?',
        isPrivate: false,
        reactions: [3, 1, 2],
      },
      {
        author: 'romantico_sp',
        action: 'fala para',
        recipient: 'gata_sp_98',
        text: 'tem sim, eu moro na zona oeste, perto do shopping',
        isPrivate: false,
        reactions: [1, 0, 2],
      },
      {
        // Reservada entre terceiros (QA 4.5).
        author: 'solitaria_99',
        action: 'sussurra para',
        recipient: 'romantico_sp',
        text: 'psst... acho que a gata tá paquerando você, aproveita',
        isPrivate: true,
        reactions: [0, 0, 0],
      },
      {
        author: 'morena_paulista',
        action: 'grita com',
        recipient: 'Todos',
        text: 'alguém me chama pra sair hoje!!! sábado é sábado!!!',
        isPrivate: false,
        reactions: [2, 4, 1],
      },
      {
        author: 'doce_paulista',
        action: 'concorda com',
        recipient: 'romantico_sp',
        text: 'zona oeste tem os melhores cafés da cidade',
        isPrivate: false,
        reactions: [2, 0, 1],
      },
      {
        author: 'flerte_sutil',
        action: 'sussurra para',
        recipient: 'Todos',
        text: 'psst... quem quer trocar um flerte hoje?',
        isPrivate: false,
        reactions: [1, 1, 2],
      },
    ],
  },
  {
    id: 'splash',
    name: 'Splash Reality',
    topic: 'Ao vivo: quem sai da casa hoje?',
    color: '#CB0003',
    nicks: [
      'splash_fan_1', 'xepa_fiel', 'lider_da_semana', 'anjo_da_semana',
      'prova_final', 'confissao_03', 'paredao_hoje', 'voto_no_lider',
      'comida_quente', 'xepa_novamente', 'falso_xepa', 'aluguel_350',
      'camara_escura', 'voz_do_paredao', 'monitor_24h', 'torcida_bro',
      'eliminado_hoje', 'finalista_99',
    ],
    messages: [
      {
        author: 'paredao_hoje',
        action: 'fala para',
        recipient: 'Todos',
        text: 'formado o paredão, quem sai hoje?',
        isPrivate: false,
        reactions: [2, 0, 1],
      },
      {
        author: 'xepa_fiel',
        action: 'grita com',
        recipient: 'Todos',
        text: 'a xepa não merece isso!!! quem votou?!?',
        isPrivate: false,
        reactions: [1, 5, 0],
      },
      {
        // Reservada entre terceiros (QA 4.5).
        author: 'lider_da_semana',
        action: 'sussurra para',
        recipient: 'anjo_da_semana',
        text: 'me protege no paredão que eu te levo até a final',
        isPrivate: true,
        reactions: [0, 0, 0],
      },
      {
        author: 'splash_fan_1',
        action: 'concorda com',
        recipient: 'paredao_hoje',
        text: 'a enquete já aponta eliminação hoje, é papo furado',
        isPrivate: false,
        reactions: [2, 1, 0],
      },
      {
        author: 'voz_do_paredao',
        action: 'fala para',
        recipient: 'Todos',
        text: 'votação aberta, resultado ao vivo no telão depois do intervalo',
        isPrivate: false,
        reactions: [3, 0, 1],
      },
    ],
  },
];

/** Timestamp base do histórico seed (+7s por mensagem, ordem `createdAt` asc). */
const SEED_BASE_MS = Date.parse('2026-11-10T12:00:00.000Z');
const SEED_STEP_MS = 7_000;

/** Monta o `reactions` com o set canônico completo zerado/pre-contado. */
function buildReactions(counts: [number, number, number]): Record<string, number> {
  const out: Record<string, number> = {};
  REACTION_EMOJIS.forEach((emoji, i) => {
    out[emoji] = counts[i] ?? 0;
  });
  return out;
}

/** Estado mutável por sala — presença seed é permanente (lotação do seed). */
const states: ChatRoomState[] = ROOMS.map((draft) => ({
  meta: {
    id: draft.id,
    name: draft.name,
    topic: draft.topic,
    capacity: 40,
    color: draft.color,
    createdAt: '2026-11-10T09:00:00.000Z',
  },
  presence: draft.nicks.map((nick) => ({
    nick,
    lastSeenAt: new Date().toISOString(),
    seed: true,
  })),
  messages: draft.messages.map((m) => ({
    id: '',
    roomId: draft.id,
    author: m.author,
    action: m.action,
    recipient: m.recipient,
    text: m.text,
    isPrivate: m.isPrivate,
    reactions: buildReactions(m.reactions),
    createdAt: '',
  })),
}));

// Ids sequenciais globais e estáveis por boot (precedente `short-N` do flash).
let msgSeq = 0;
const messagesById = new Map<string, Message>();
for (const state of states) {
  for (const message of state.messages) {
    msgSeq += 1;
    message.id = `msg-${msgSeq}`;
    message.createdAt = new Date(SEED_BASE_MS + (msgSeq - 1) * SEED_STEP_MS).toISOString();
    messagesById.set(message.id, message);
  }
}

/** Varredura preguiçosa: remove apelidos dinâmicos sem sinal há mais de 10s. */
function sweepPresence(state: ChatRoomState): void {
  const now = Date.now();
  state.presence = state.presence.filter(
    (p) => p.seed || now - Date.parse(p.lastSeenAt) <= PRESENCE_TTL_MS,
  );
}

/** Sala como entidade do contrato, com `online = participants.length` (decisão 8/9). */
function toRoom(state: ChatRoomState): Room {
  return { ...state.meta, online: state.presence.length };
}

/** Lista as salas com lotação fresca (varredura preguiçosa no read path). */
export function listRooms(): Room[] {
  for (const state of states) sweepPresence(state);
  return states.map(toRoom);
}

/** Busca o estado de uma sala (varrido); `undefined` = inexistente. */
export function findRoomState(roomId: string): ChatRoomState | undefined {
  const state = states.find((s) => s.meta.id === roomId);
  if (state) sweepPresence(state);
  return state;
}

/** Apelido já está presente na sala? (chamar após `findRoomState` — já varrido) */
export function isNickPresent(state: ChatRoomState, nick: string): boolean {
  return state.presence.some((p) => p.nick === nick);
}

/** Registra a presença do apelido e devolve o `EnterResult` (decisão 2/3). */
export function enterRoom(state: ChatRoomState, nick: string): EnterResult {
  state.presence.push({ nick, lastSeenAt: new Date().toISOString(), seed: false });
  return {
    roomId: state.meta.id,
    nick,
    online: state.presence.length,
    participants: state.presence.map((p) => p.nick),
  };
}

/**
 * Saída explícita: remove a presença do apelido imediatamente (spec `chat-presence`
 * › "Saída explícita da sala") — a presença não espera o TTL. Idempotente: repetir
 * quando o apelido já não está presente devolve o estado atual. Nicks de seed são
 * permanentes (decisão 2), então sair com um apelido do seed é no-op — a lotação
 * do seed ("35/40") não evapora.
 */
export function leaveRoom(state: ChatRoomState, nick: string): EnterResult {
  state.presence = state.presence.filter((p) => p.seed || p.nick !== nick);
  return {
    roomId: state.meta.id,
    nick,
    online: state.presence.length,
    participants: state.presence.map((p) => p.nick),
  };
}

/**
 * Feed da sala: reservadas filtradas no servidor (só o par autor/destinatário),
 * `?nick=` refresca o TTL de presença, ordem `createdAt` asc, últimas `limit`.
 */
export function getRoomFeed(
  state: ChatRoomState,
  nick: string | null,
  limit: number,
): RoomFeed {
  sweepPresence(state);

  // Sinal de vida: o polling com `?nick=` refresca o TTL (decisão 2).
  if (nick !== null) {
    const entry = state.presence.find((p) => p.nick === nick);
    if (entry) entry.lastSeenAt = new Date().toISOString();
  }

  const visible = state.messages
    .filter((m) => !m.isPrivate || m.author === nick || m.recipient === nick)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    .slice(-limit);

  return {
    messages: visible,
    participants: state.presence.map((p) => p.nick),
  };
}

/** Payload já validado para criação de mensagem (validação vive na rota). */
export interface CreateMessageInput {
  author: string;
  action: ChatAction;
  recipient: string;
  text: string;
  isPrivate: boolean;
}

/** Cria mensagem: `id`/`createdAt`/`reactions` zerado atribuídos pelo servidor. */
export function createMessage(state: ChatRoomState, input: CreateMessageInput): Message {
  msgSeq += 1;
  const message: Message = {
    id: `msg-${msgSeq}`,
    roomId: state.meta.id,
    author: input.author,
    action: input.action,
    recipient: input.recipient,
    text: input.text,
    isPrivate: input.isPrivate,
    reactions: buildReactions([0, 0, 0]),
    createdAt: new Date().toISOString(),
  };
  state.messages.push(message);
  messagesById.set(message.id, message);
  return message;
}

/** Busca uma mensagem por `id` em qualquer sala (para o `POST /messages/:id/react`). */
export function findMessageById(messageId: string): Message | undefined {
  return messagesById.get(messageId);
}

/** Incrementa a reação da mensagem; `undefined` = mensagem inexistente. */
export function reactToMessage(messageId: string, emoji: ReactionEmoji): Message | undefined {
  const message = messagesById.get(messageId);
  if (!message) return undefined;
  message.reactions[emoji] = (message.reactions[emoji] ?? 0) + 1;
  return message;
}
