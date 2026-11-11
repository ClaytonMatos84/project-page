import { Router } from 'express';
import type { ChatAction, ReactionEmoji } from '@uol/shared';
import { sendEnvelope } from '../envelope';
import { badRequest, notFound } from '../errors';
import {
  CHAT_ACTIONS,
  CreateMessageInput,
  ChatRoomState,
  DEFAULT_FEED_LIMIT,
  MAX_FEED_LIMIT,
  NICK_REGEX,
  REACTION_EMOJIS,
  createMessage,
  enterRoom,
  findMessageById,
  findRoomState,
  getRoomFeed,
  isNickPresent,
  leaveRoom,
  listRooms,
  reactToMessage,
} from '../data/chat-seed';

/**
 * Rotas do Bate-Papo UOL Next-Gen (§3.3) — reusam envelope/erros/telemetria
 * da fundação. Contrato congelado (Track A): `GET /rooms`, `POST /rooms/:id/enter`,
 * `POST /rooms/:id/leave`, `GET /rooms/:id/messages`, `POST /rooms/:id/messages`,
 * `POST /messages/:id/react`.
 */
export const chatRouter: Router = Router();

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function trimmedString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() : null;
}

/** Interpreta `limit` do feed: default 50, teto 200 (decisão 11). */
function parseFeedLimit(raw: unknown): number {
  if (typeof raw !== 'string' || raw.trim() === '') return DEFAULT_FEED_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_FEED_LIMIT;
  return Math.min(n, MAX_FEED_LIMIT);
}

/** Interpreta `?nick=`: string não vazia ou `null` (espectador). */
function parseNickQuery(raw: unknown): string | null {
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
}

/**
 * Valida o payload de mensagem espelhando a spec `chat-messages`
 * ("Payload de mensagem inválido"). Retorna o input tipado ou lança `badRequest`.
 */
function parseMessagePayload(state: ChatRoomState, body: unknown): CreateMessageInput {
  if (!isObject(body)) {
    throw badRequest('Request body must be a JSON object');
  }

  const author = trimmedString(body.author);
  if (author === null || !NICK_REGEX.test(author)) {
    throw badRequest("Field 'author' must match ^[\\w-]{2,24}$");
  }

  const action = trimmedString(body.action);
  if (action === null || !(CHAT_ACTIONS as readonly string[]).includes(action)) {
    throw badRequest('Invalid action');
  }

  const text = trimmedString(body.text);
  if (text === null || text.length < 1 || text.length > 500) {
    throw badRequest("Field 'text' is required and must be 1-500 characters");
  }

  let isPrivate = false;
  if (body.isPrivate !== undefined && typeof body.isPrivate !== 'boolean') {
    throw badRequest("Field 'isPrivate' must be a boolean");
  }
  isPrivate = body.isPrivate === true;

  const recipient = trimmedString(body.recipient);
  if (recipient === null || (recipient !== 'Todos' && !isNickPresent(state, recipient))) {
    throw badRequest("Field 'recipient' must be 'Todos' or a nick present in the room");
  }

  if (isPrivate && recipient === 'Todos') {
    throw badRequest('Private message requires a specific recipient');
  }

  return { author, action: action as ChatAction, recipient, text, isPrivate };
}

/**
 * GET /api/chat/rooms — salas com `online = participants.length`,
 * `capacity` e `color` (spec `chat-rooms`).
 */
chatRouter.get('/api/chat/rooms', (_req, res) => {
  sendEnvelope(res, listRooms());
});

/**
 * POST /api/chat/rooms/:id/enter — entrada com apelido (decisão 2/3).
 * `404` sala inexistente; `400` apelido fora da regex ou em uso na sala.
 */
chatRouter.post('/api/chat/rooms/:id/enter', (req, res, next) => {
  const state = findRoomState(req.params.id);
  if (!state) {
    next(notFound(`Room '${req.params.id}' not found`));
    return;
  }

  const nick = isObject(req.body) ? trimmedString(req.body.nick) : null;
  if (nick === null || !NICK_REGEX.test(nick)) {
    next(badRequest("Field 'nick' must match ^[\\w-]{2,24}$"));
    return;
  }

  if (isNickPresent(state, nick)) {
    next(badRequest('Nick already taken in this room'));
    return;
  }

  sendEnvelope(res, enterRoom(state, nick));
});

/**
 * POST /api/chat/rooms/:id/leave — saída explícita com apelido (spec
 * `chat-presence` › "Saída explícita da sala"): remove a presença imediatamente
 * e devolve participantes/online atualizados. Idempotente; `404` sala inexistente.
 */
chatRouter.post('/api/chat/rooms/:id/leave', (req, res, next) => {
  const state = findRoomState(req.params.id);
  if (!state) {
    next(notFound(`Room '${req.params.id}' not found`));
    return;
  }

  const nick = isObject(req.body) ? trimmedString(req.body.nick) : null;
  if (nick === null || nick === '') {
    next(badRequest("Field 'nick' is required"));
    return;
  }

  sendEnvelope(res, leaveRoom(state, nick));
});

/**
 * GET /api/chat/rooms/:id/messages?nick=&limit= — feed + participantes
 * piggyback (decisão 9); reservadas filtradas no servidor (decisão 4);
 * `?nick=` refresca o TTL de presença (decisão 2). `404` sala inexistente.
 */
chatRouter.get('/api/chat/rooms/:id/messages', (req, res, next) => {
  const state = findRoomState(req.params.id);
  if (!state) {
    next(notFound(`Room '${req.params.id}' not found`));
    return;
  }
  const nick = parseNickQuery(req.query.nick);
  sendEnvelope(res, getRoomFeed(state, nick, parseFeedLimit(req.query.limit)));
});

/**
 * POST /api/chat/rooms/:id/messages — envio com ação/destinatário/reservadamente.
 * `400` validação; `404` sala inexistente; `201` com a mensagem criada
 * (`id`/`reactions` zerado/`createdAt` pelo servidor).
 */
chatRouter.post('/api/chat/rooms/:id/messages', (req, res, next) => {
  try {
    const state = findRoomState(req.params.id);
    if (!state) {
      next(notFound(`Room '${req.params.id}' not found`));
      return;
    }
    const input = parseMessagePayload(state, req.body);
    sendEnvelope(res, createMessage(state, input), 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chat/messages/:id/react — incrementa reação do set canônico
 * (decisão 7). `404` mensagem inexistente; `400` emoji fora do set.
 */
chatRouter.post('/api/chat/messages/:id/react', (req, res, next) => {
  const message = findMessageById(req.params.id);
  if (!message) {
    next(notFound(`Message '${req.params.id}' not found`));
    return;
  }

  const emoji = isObject(req.body) ? trimmedString(req.body.emoji) : null;
  if (emoji === null || !(REACTION_EMOJIS as readonly string[]).includes(emoji)) {
    next(badRequest('Invalid emoji'));
    return;
  }

  sendEnvelope(res, reactToMessage(req.params.id, emoji as ReactionEmoji));
});
