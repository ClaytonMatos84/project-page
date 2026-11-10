#!/usr/bin/env node
/**
 * QA/Demo — Track D. Smoke de contrato do Mini Portal UOL.
 *
 * Cenários: 4.1 (highlights + polling de contrato), 4.2 (listagem/editorias +
 * limite default 10), 4.3 (detalhe 404 no formato padrão), 4.4 (busca:
 * resultado, vazio e 400 sem termo).
 *
 * Uso: node qa/scripts/portal-smoke.mjs   (BASE_URL opcional, default :3001)
 * Sai com código != 0 se qualquer verificação falhar.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

let passed = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const isInt = (v) => typeof v === 'number' && Number.isInteger(v);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';
const hasTelemetry = (meta) =>
  meta && isInt(meta.latencyMs) && meta.latencyMs >= 0 && meta.contract === 'v1' && isNonEmptyString(meta.traceId);

const hasArticleShape = (a) =>
  a &&
  isNonEmptyString(a.id) &&
  isNonEmptyString(a.title) &&
  isNonEmptyString(a.summary) &&
  isNonEmptyString(a.editoria) &&
  isNonEmptyString(a.publishedAt) &&
  isNonEmptyString(a.imageUrl) &&
  isNonEmptyString(a.url);

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

const isJsonUtf8 = (res) => (res.headers.get('content-type') ?? '') === 'application/json; charset=utf-8';

function report() {
  console.log(`\nResultado: ${passed} PASS · ${failures.length} FAIL`);
  if (failures.length > 0) {
    console.log('\nFalhas:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('Contrato do Mini Portal UOL verificado.\n');
}

async function main() {
  console.log(`\n[4.1..4.4] Smoke do Mini Portal UOL — ${BASE_URL}\n`);

  // --- 4.1 highlights + article embutido ---
  console.log('4.1 GET /api/portal/highlights');
  const hl = await get('/api/portal/highlights');
  check('highlights: status 200', hl.res.status === 200, `got ${hl.res.status}`);
  check('highlights: Content-Type utf-8', isJsonUtf8(hl.res));
  check('highlights: data é array não vazio', Array.isArray(hl.body?.data) && hl.body.data.length > 0);
  check('highlights: telemetria completa', hasTelemetry(hl.body?.meta));
  const items = hl.body?.data ?? [];
  check(
    'highlights: cada item tem articleId/position/label/article',
    items.every(
      (h) =>
        isNonEmptyString(h.articleId) &&
        isInt(h.position) &&
        isNonEmptyString(h.label) &&
        hasArticleShape(h.article) &&
        h.article.id === h.articleId,
    ),
  );
  check(
    'highlights: posições em ordem crescente',
    items.every((h, i) => i === 0 || items[i - 1].position <= h.position),
  );

  // --- 4.2 editorias + listagem + limite default 10 ---
  console.log('\n4.2 GET /api/portal/editorias e /api/portal/articles');
  const ed = await get('/api/portal/editorias');
  check('editorias: status 200', ed.res.status === 200, `got ${ed.res.status}`);
  check(
    'editorias: cada uma tem id/name/slug/color',
    Array.isArray(ed.body?.data) &&
      ed.body.data.every(
        (e) => isNonEmptyString(e.id) && isNonEmptyString(e.name) && isNonEmptyString(e.slug) && isNonEmptyString(e.color),
      ),
  );
  check('editorias: telemetria completa', hasTelemetry(ed.body?.meta));

  const defaultLimit = await get('/api/portal/articles');
  check(
    'articles: sem limit retorna no máximo 10 (default)',
    Array.isArray(defaultLimit.body?.data) && defaultLimit.body.data.length === 10,
    `length ${defaultLimit.body?.data?.length}`,
  );
  const explicit = await get('/api/portal/articles?limit=3');
  check('articles: limit=3 retorna 3', explicit.body?.data?.length === 3, `length ${explicit.body?.data?.length}`);
  const byEd = await get('/api/portal/articles?editoria=esportes');
  check(
    'articles: filtro por editoria só devolve a editoria pedida',
    Array.isArray(byEd.body?.data) && byEd.body.data.every((a) => a.editoria === 'esportes') && byEd.body.data.length > 0,
  );
  check('articles: cada artigo tem forma completa', (byEd.body?.data ?? []).every(hasArticleShape));

  // --- 4.3 detalhe + 404 padrão ---
  console.log('\n4.3 GET /api/portal/articles/:id');
  const okDetail = await get('/api/portal/articles/art-1');
  check('detalhe: status 200 com forma completa', okDetail.res.status === 200 && hasArticleShape(okDetail.body?.data));
  check('detalhe: url de leitura', okDetail.body?.data?.url === '/leitura/art-1', okDetail.body?.data?.url);
  const nf = await get('/api/portal/articles/nao-existe');
  check('404: status 404', nf.res.status === 404, `got ${nf.res.status}`);
  check('404: data = null', nf.body?.data === null);
  check('404: error.code = NOT_FOUND', nf.body?.error?.code === 'NOT_FOUND');
  check('404: error.message não vazio', isNonEmptyString(nf.body?.error?.message));
  check('404: telemetria presente (mesmo em erro)', hasTelemetry(nf.body?.meta));

  // --- 4.4 busca: resultado, vazio e 400 ---
  console.log('\n4.4 GET /api/portal/search?q=');
  const hit = await get('/api/portal/search?q=EconomIA');
  check('busca: status 200', hit.res.status === 200, `got ${hit.res.status}`);
  check('busca: case-insensitive devolve resultados', Array.isArray(hit.body?.data) && hit.body.data.length >= 1);
  check('busca: resultados com forma de Article', (hit.body?.data ?? []).every(hasArticleShape));
  const empty = await get('/api/portal/search?q=zzzznaoexiste');
  check('busca: termo sem match devolve array vazio', Array.isArray(empty.body?.data) && empty.body.data.length === 0);
  const missing = await get('/api/portal/search');
  check('busca: sem q → 400', missing.res.status === 400, `got ${missing.res.status}`);
  check('busca: 400 com data null + BAD_REQUEST', missing.body?.data === null && missing.body?.error?.code === 'BAD_REQUEST');
  const blank = await get('/api/portal/search?q=');
  check('busca: q vazio → 400', blank.res.status === 400, `got ${blank.res.status}`);

  report();
}

main().catch((err) => {
  console.error(`\nErro ao executar smoke: ${err?.message ?? err}`);
  console.error(`A API está rodando em ${BASE_URL}? (npm run dev:backend)`);
  process.exit(2);
});
