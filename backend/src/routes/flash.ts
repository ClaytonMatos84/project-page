import { Router } from 'express';
import type { EditoriaSlug, ShortMediaType } from '@uol/shared';
import { sendEnvelope } from '../envelope';
import { badRequest, notFound } from '../errors';
import {
  addReaction,
  addVote,
  createShort,
  findShort,
  listShorts,
  type CreateShortInput,
  type ShortSort,
} from '../data/flash-seed';

/**
 * Rotas do UOL Flash Short (§3.2) — reusam envelope/erros/telemetria da fundação.
 * Contrato congelado (Track A): `GET /shorts`, `GET /shorts/:id`,
 * `POST /shorts`, `POST /shorts/:id/reactions`, `POST /shorts/:id/vote`.
 */
export const flashRouter: Router = Router();

/** Limite default da listagem (spec `flash-shorts`: default 20). */
const DEFAULT_LIMIT = 20;

/** Os 5 slugs canônicos de editoria (§5.2). */
const CANONICAL_EDITORIAS: ReadonlySet<string> = new Set([
  'noticias',
  'esportes',
  'economia',
  'entretenimento',
  'tecnologia',
]);

const MEDIA_TYPES: ReadonlySet<string> = new Set(['image', 'video']);

/** `mediaUrl`/`articleUrl` devem ser http(s) (decisão de design 8). */
const HTTP_URL = /^https?:\/\/\S+$/i;

/** Interpreta `limit`; valores ausentes/inválidos caem no default (precedente do portal). */
function parseLimit(raw: unknown): number {
  if (typeof raw !== 'string' || raw.trim() === '') return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT;
}

/** Interpreta `sort`; anything ≠ `popular` cai no default `recent`. */
function parseSort(raw: unknown): ShortSort {
  return raw === 'popular' ? 'popular' : 'recent';
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function trimmedString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() : null;
}

/**
 * Valida o payload de publicação espelhando a spec `flash-shorts`
 * ("Validação da publicação"). Retorna o input tipado ou lança `badRequest`.
 */
function parseShortPayload(body: unknown): CreateShortInput {
  if (!isObject(body)) {
    throw badRequest('Request body must be a JSON object');
  }

  const title = trimmedString(body.title);
  if (title === null || title.length < 1 || title.length > 120) {
    throw badRequest("Field 'title' is required and must be 1-120 characters");
  }

  const text = trimmedString(body.body);
  if (text === null || text.length < 1 || text.length > 500) {
    throw badRequest("Field 'body' is required and must be 1-500 characters");
  }

  const editoria = trimmedString(body.editoria);
  if (editoria === null || !CANONICAL_EDITORIAS.has(editoria)) {
    throw badRequest('editoria must be one of the canonical slugs');
  }

  const mediaUrl = trimmedString(body.mediaUrl);
  if (mediaUrl === null || !HTTP_URL.test(mediaUrl)) {
    throw badRequest("Field 'mediaUrl' must be a valid http(s) URL");
  }

  const mediaType = trimmedString(body.mediaType);
  if (mediaType === null || !MEDIA_TYPES.has(mediaType)) {
    throw badRequest("Field 'mediaType' must be 'image' or 'video'");
  }

  const articleUrl = trimmedString(body.articleUrl);
  if (articleUrl !== null && articleUrl !== '' && !HTTP_URL.test(articleUrl)) {
    throw badRequest("Field 'articleUrl' must be a valid http(s) URL");
  }

  let poll: CreateShortInput['poll'];
  if (body.poll !== undefined && body.poll !== null) {
    if (!isObject(body.poll)) {
      throw badRequest("Field 'poll' must be an object with 'question' and 'options'");
    }
    const question = trimmedString(body.poll.question);
    if (question === null || question.length < 1 || question.length > 120) {
      throw badRequest('Poll question must be 1-120 characters');
    }
    const rawOptions = body.poll.options;
    if (!Array.isArray(rawOptions)) {
      throw badRequest("Field 'poll.options' must be an array of 2-4 non-empty options");
    }
    const options = rawOptions.map(trimmedString);
    if (
      options.length < 2 ||
      options.length > 4 ||
      options.some((o) => o === null || o === '')
    ) {
      throw badRequest('Poll must have 2 to 4 non-empty options');
    }
    poll = { question, options: options as string[] };
  }

  return {
    title,
    body: text,
    editoria: editoria as EditoriaSlug,
    mediaUrl,
    mediaType: mediaType as ShortMediaType,
    ...(articleUrl ? { articleUrl } : {}),
    ...(poll ? { poll } : {}),
  };
}

/**
 * GET /api/flash/shorts?sort=recent|popular&limit=<n>
 * Feed ordenado por recência (`createdAt` desc, default) ou popularidade
 * (`reactions` desc), limitável (default 20).
 */
flashRouter.get('/api/flash/shorts', (req, res) => {
  const sort = parseSort(req.query.sort);
  const limit = parseLimit(req.query.limit);
  sendEnvelope(res, listShorts(sort, limit));
});

/**
 * GET /api/flash/shorts/:id — detalhe do short;
 * `404` (formato padrão) quando o `id` não existe.
 */
flashRouter.get('/api/flash/shorts/:id', (req, res, next) => {
  const short = findShort(req.params.id);
  if (!short) {
    next(notFound(`Short '${req.params.id}' not found`));
    return;
  }
  sendEnvelope(res, short);
});

/**
 * POST /api/flash/shorts — publica um novo short.
 * `400` (BAD_REQUEST) em validação; `201` com o short criado
 * (`reactions: 0`, `durationMs` derivado do `body`).
 */
flashRouter.post('/api/flash/shorts', (req, res, next) => {
  try {
    const input = parseShortPayload(req.body);
    const created = createShort(input);
    sendEnvelope(res, created, 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flash/shorts/:id/reactions — incrementa a reação do short e
 * responde a entidade `Reaction` (`shortId`, `count`, `updatedAt`).
 * `404` para short inexistente.
 */
flashRouter.post('/api/flash/shorts/:id/reactions', (req, res, next) => {
  const reaction = addReaction(req.params.id);
  if (!reaction) {
    next(notFound(`Short '${req.params.id}' not found`));
    return;
  }
  sendEnvelope(res, reaction);
});

/**
 * POST /api/flash/shorts/:id/vote — vota na enquete do short com `{ optionId }`.
 * `200` com o `poll` atualizado; `400` para opção ausente/inexistente ou short
 * sem enquete; `404` para short inexistente.
 */
flashRouter.post('/api/flash/shorts/:id/vote', (req, res, next) => {
  const short = findShort(req.params.id);
  if (!short) {
    next(notFound(`Short '${req.params.id}' not found`));
    return;
  }
  if (!short.poll) {
    next(badRequest('Short has no poll'));
    return;
  }
  const optionId = isObject(req.body) ? trimmedString(req.body.optionId) : null;
  if (optionId === null || optionId === '') {
    next(badRequest("Field 'optionId' is required"));
    return;
  }
  const result = addVote(req.params.id, optionId);
  if (result === undefined || result === 'no-poll' || result === 'bad-option') {
    next(badRequest('Invalid poll option'));
    return;
  }
  sendEnvelope(res, result);
});
