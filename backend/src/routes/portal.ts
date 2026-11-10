import { Router } from 'express';
import type { Article, HighlightWithArticle } from '@uol/shared';
import { sendEnvelope } from '../envelope';
import { badRequest, notFound } from '../errors';
import { editorias, findArticle, highlights, listArticles } from '../data/seed';

export const portalRouter: Router = Router();

/** Limite default da listagem (§ portal-articles: "Limite default da listagem"). */
const DEFAULT_LIMIT = 10;

/** Interpreta `limit`; valores ausentes/inválidos caem no default. */
function parseLimit(raw: unknown): number {
  if (typeof raw !== 'string' || raw.trim() === '') return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT;
}

/**
 * GET /api/portal/highlights — destaques da home com o `article` embutido,
 * em ordem de posição (evita N+1 no cliente).
 */
portalRouter.get('/api/portal/highlights', (_req, res) => {
  const data: HighlightWithArticle[] = highlights
    .slice()
    .sort((a, b) => a.position - b.position)
    .flatMap((h) => {
      const article = findArticle(h.articleId);
      return article ? [{ ...h, article }] : [];
    });
  sendEnvelope(res, data);
});

/** GET /api/portal/editorias — lista de editorias para navegação e chips. */
portalRouter.get('/api/portal/editorias', (_req, res) => {
  sendEnvelope(res, editorias);
});

/**
 * GET /api/portal/articles?editoria=<slug>&limit=<n>
 * Lista artigos filtráveis por editoria e limitáveis (`limit` default 10).
 */
portalRouter.get('/api/portal/articles', (req, res) => {
  const editoria = typeof req.query.editoria === 'string' ? req.query.editoria : undefined;
  const limit = parseLimit(req.query.limit);
  const data: Article[] = listArticles(editoria).slice(0, limit);
  sendEnvelope(res, data);
});

/**
 * GET /api/portal/articles/:id — detalhe do artigo;
 * `404` (formato padrão) quando o `id` não existe.
 */
portalRouter.get('/api/portal/articles/:id', (req, res, next) => {
  const article = findArticle(req.params.id);
  if (!article) {
    next(notFound(`Article '${req.params.id}' not found`));
    return;
  }
  sendEnvelope(res, article);
});

/**
 * GET /api/portal/search?q=<termo> — busca simples case-insensitive
 * sobre `title` e `summary`; `400` (BAD_REQUEST) quando `q` ausente/vazio.
 */
portalRouter.get('/api/portal/search', (req, res, next) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q === '') {
    next(badRequest("Query param 'q' is required"));
    return;
  }

  const term = q.toLocaleLowerCase('pt-BR');
  const data: Article[] = listArticles().filter((a) => {
    const haystack = `${a.title}\n${a.summary}`.toLocaleLowerCase('pt-BR');
    return haystack.includes(term);
  });

  sendEnvelope(res, data);
});
