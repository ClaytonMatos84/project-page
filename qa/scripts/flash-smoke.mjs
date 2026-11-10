#!/usr/bin/env node
/**
 * QA/Demo — Track D. Smoke de contrato do UOL Flash Short.
 *
 * Cenários: 4.1 (feed recent/popular + polling de contrato), 4.2 (reação:
 * 200 com count incrementado + 404), 4.3 (voto: 200 com totalVotes
 * consistente + 400 opção inválida/sem enquete + 404), 4.4 (publicação: 201 no
 * topo do feed + 400 editoria inválida), 4.5 (404 no detalhe + envelope
 * `{ data, meta }` com latencyMs/contract/traceId em tudo, inclusive erro).
 *
 * Uso: node qa/scripts/flash-smoke.mjs   (BASE_URL opcional, default :3001)
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

const CANONICAL = ['noticias', 'esportes', 'economia', 'entretenimento', 'tecnologia'];

function hasShortShape(s) {
  return (
    s &&
    isNonEmptyString(s.id) &&
    isNonEmptyString(s.title) &&
    isNonEmptyString(s.body) &&
    isInt(s.durationMs) &&
    s.durationMs > 0 &&
    CANONICAL.includes(s.editoria) &&
    isInt(s.reactions) &&
    s.reactions >= 0 &&
    isNonEmptyString(s.createdAt) &&
    isNonEmptyString(s.mediaUrl) &&
    (s.mediaType === 'image' || s.mediaType === 'video') &&
    (s.articleUrl === undefined || isNonEmptyString(s.articleUrl)) &&
    (s.poll === undefined || hasPollShape(s.poll))
  );
}

function hasPollShape(poll) {
  return (
    poll &&
    isNonEmptyString(poll.question) &&
    Array.isArray(poll.options) &&
    poll.options.length >= 2 &&
    poll.options.every((o) => isNonEmptyString(o.id) && isNonEmptyString(o.label) && isInt(o.votes) && o.votes >= 0) &&
    isInt(poll.totalVotes) &&
    poll.totalVotes === poll.options.reduce((acc, o) => acc + o.votes, 0)
  );
}

async function req(path, init) {
  const res = await fetch(`${BASE_URL}${path}`, init);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

const post = (path, payload) =>
  req(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

const isJsonUtf8 = (res) => (res.headers.get('content-type') ?? '') === 'application/json; charset=utf-8';

function report() {
  console.log(`\nResultado: ${passed} PASS · ${failures.length} FAIL`);
  if (failures.length > 0) {
    console.log('\nFalhas:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('Contrato do UOL Flash Short verificado.\n');
}

async function main() {
  console.log(`\n[4.1..4.5] Smoke do UOL Flash Short — ${BASE_URL}\n`);

  // --- 4.1 feed recent/popular + limite ---
  console.log('4.1 GET /api/flash/shorts (recent/popular/limit)');
  const recent = await req('/api/flash/shorts?sort=recent&limit=20');
  check('recent: status 200', recent.res.status === 200, `got ${recent.res.status}`);
  check('recent: Content-Type utf-8', isJsonUtf8(recent.res));
  check('recent: data é array não vazio', Array.isArray(recent.body?.data) && recent.body.data.length > 0);
  check('recent: telemetria completa', hasTelemetry(recent.body?.meta));
  const shorts = recent.body?.data ?? [];
  check('recent: cada short tem forma completa do contrato', shorts.every(hasShortShape));
  check(
    'recent: ordenação por createdAt desc',
    shorts.every((s, i) => i === 0 || Date.parse(shorts[i - 1].createdAt) >= Date.parse(s.createdAt)),
  );
  check(
    'recent: seed cobre as 5 editorias canônicas',
    new Set(shorts.map((s) => s.editoria)).size === 5,
  );
  check(
    'recent: mídia vertical picsum 720/1280 no seed',
    shorts.some((s) => s.mediaUrl.includes('/720/1280')),
  );

  const popular = await req('/api/flash/shorts?sort=popular');
  check('popular: status 200', popular.res.status === 200);
  const popularShorts = popular.body?.data ?? [];
  check(
    'popular: ordenação por reactions desc',
    Array.isArray(popularShorts) &&
      popularShorts.every((s, i) => i === 0 || popularShorts[i - 1].reactions >= s.reactions),
  );
  check('popular: telemetria completa', hasTelemetry(popular.body?.meta));

  const limited = await req('/api/flash/shorts?limit=2');
  check('limit=2: retorna exatamente 2', limited.body?.data?.length === 2, `length ${limited.body?.data?.length}`);

  // --- 4.2 reação: 200 com count incrementado + 404 ---
  console.log('\n4.2 POST /api/flash/shorts/:id/reactions');
  const target = shorts[0];
  const before = target.reactions;
  const reaction = await post(`/api/flash/shorts/${target.id}/reactions`);
  check('reação: status 200', reaction.res.status === 200, `got ${reaction.res.status}`);
  check(
    'reação: data com shortId/count/updatedAt',
    reaction.body?.data?.shortId === target.id && isInt(reaction.body?.data?.count) && isNonEmptyString(reaction.body?.data?.updatedAt),
  );
  check('reação: count incrementado em relação ao feed', reaction.body?.data?.count === before + 1, `count ${reaction.body?.data?.count} vs before+1 ${before + 1}`);
  check('reação: telemetria completa', hasTelemetry(reaction.body?.meta));

  const reactionNf = await post('/api/flash/shorts/nao-existe/reactions');
  check('reação 404: status 404', reactionNf.res.status === 404, `got ${reactionNf.res.status}`);
  check('reação 404: data null + NOT_FOUND', reactionNf.body?.data === null && reactionNf.body?.error?.code === 'NOT_FOUND');
  check('reação 404: telemetria presente (mesmo em erro)', hasTelemetry(reactionNf.body?.meta));

  // --- 4.3 voto: 200 consistente + 400s + 404 ---
  console.log('\n4.3 POST /api/flash/shorts/:id/vote');
  const withPoll = shorts.find((s) => s.poll);
  const withoutPoll = shorts.find((s) => !s.poll);
  check('seed: existe short com e sem enquete', Boolean(withPoll) && Boolean(withoutPoll));

  const option = withPoll.poll.options[0];
  const vote = await post(`/api/flash/shorts/${withPoll.id}/vote`, { optionId: option.id });
  check('voto: status 200', vote.res.status === 200, `got ${vote.res.status}`);
  check('voto: poll atualizado com forma completa', hasPollShape(vote.body?.data));
  check(
    'voto: votes da opção incrementado',
    vote.body?.data?.options?.find((o) => o.id === option.id)?.votes === option.votes + 1,
  );
  check(
    'voto: totalVotes = soma das opções',
    vote.body?.data?.totalVotes === vote.body.data.options.reduce((acc, o) => acc + o.votes, 0),
  );
  check('voto: telemetria completa', hasTelemetry(vote.body?.meta));

  const badOption = await post(`/api/flash/shorts/${withPoll.id}/vote`, { optionId: 'opt-inexistente' });
  check('voto 400 (opção inexistente): status 400', badOption.res.status === 400, `got ${badOption.res.status}`);
  check('voto 400 (opção inexistente): BAD_REQUEST + data null', badOption.body?.data === null && badOption.body?.error?.code === 'BAD_REQUEST');

  const missingOption = await post(`/api/flash/shorts/${withPoll.id}/vote`, {});
  check('voto 400 (optionId ausente): status 400', missingOption.res.status === 400, `got ${missingOption.res.status}`);

  const noPoll = await post(`/api/flash/shorts/${withoutPoll.id}/vote`, { optionId: 'opt-1' });
  check('voto 400 (short sem enquete): status 400', noPoll.res.status === 400, `got ${noPoll.res.status}`);
  check('voto 400 (sem enquete): BAD_REQUEST', noPoll.body?.error?.code === 'BAD_REQUEST');

  const voteNf = await post('/api/flash/shorts/nao-existe/vote', { optionId: 'opt-1' });
  check('voto 404: status 404', voteNf.res.status === 404, `got ${voteNf.res.status}`);
  check('voto 404: NOT_FOUND + data null', voteNf.body?.data === null && voteNf.body?.error?.code === 'NOT_FOUND');
  check('voto 404: telemetria presente', hasTelemetry(voteNf.body?.meta));

  // --- 4.4 publicação: 201 no topo do feed + 400 ---
  console.log('\n4.4 POST /api/flash/shorts');
  const publishPayload = {
    title: 'Short publicado pelo smoke do QA',
    body: 'Corpo curto do short de teste publicado pelo smoke, cobrindo o contrato 201.',
    editoria: 'tecnologia',
    mediaUrl: 'https://picsum.photos/seed/qa-flash/720/1280',
    mediaType: 'image',
    articleUrl: 'https://uol.com.br/tecnologia/qa-smoke',
    poll: { question: 'O smoke funcionou?', options: ['Sim', 'Não'] },
  };
  const created = await post('/api/flash/shorts', publishPayload);
  check('publicação: status 201', created.res.status === 201, `got ${created.res.status}`);
  check('publicação: short criado com forma completa', hasShortShape(created.body?.data));
  check('publicação: reactions = 0', created.body?.data?.reactions === 0);
  check('publicação: durationMs derivado pelo servidor', isInt(created.body?.data?.durationMs) && created.body.data.durationMs > 0);
  check(
    'publicação: poll normalizado (ids do servidor, votes 0)',
    created.body?.data?.poll?.options?.every((o, i) => o.id === `opt-${i + 1}` && o.votes === 0) &&
      created.body?.data?.poll?.totalVotes === 0,
  );
  check('publicação: telemetria completa', hasTelemetry(created.body?.meta));

  const afterPublish = await req('/api/flash/shorts?sort=recent');
  check(
    'publicação: short novo no topo do feed recent',
    afterPublish.body?.data?.[0]?.id === created.body?.data?.id,
    `top ${afterPublish.body?.data?.[0]?.id} vs created ${created.body?.data?.id}`,
  );

  const invalidEditoria = await post('/api/flash/shorts', { ...publishPayload, editoria: 'politica' });
  check('publicação 400 (editoria fora das canônicas): status 400', invalidEditoria.res.status === 400, `got ${invalidEditoria.res.status}`);
  check('publicação 400: BAD_REQUEST + data null', invalidEditoria.body?.data === null && invalidEditoria.body?.error?.code === 'BAD_REQUEST');
  check('publicação 400: telemetria presente (mesmo em erro)', hasTelemetry(invalidEditoria.body?.meta));

  const invalidTitle = await post('/api/flash/shorts', { ...publishPayload, title: 'a'.repeat(121) });
  check('publicação 400 (title > 120): status 400', invalidTitle.res.status === 400, `got ${invalidTitle.res.status}`);

  const invalidMedia = await post('/api/flash/shorts', { ...publishPayload, mediaUrl: 'ftp://exemplo.com/a.jpg' });
  check('publicação 400 (mediaUrl não http(s)): status 400', invalidMedia.res.status === 400, `got ${invalidMedia.res.status}`);

  const invalidPoll = await post('/api/flash/shorts', { ...publishPayload, poll: { question: 'q', options: ['só uma'] } });
  check('publicação 400 (poll com 1 opção): status 400', invalidPoll.res.status === 400, `got ${invalidPoll.res.status}`);

  // --- 4.5 detalhe + 404 + envelope em tudo ---
  console.log('\n4.5 GET /api/flash/shorts/:id');
  const detail = await req(`/api/flash/shorts/${shorts[0].id}`);
  check('detalhe: status 200 com forma completa', detail.res.status === 200 && hasShortShape(detail.body?.data));
  check('detalhe: telemetria completa', hasTelemetry(detail.body?.meta));

  const detailNf = await req('/api/flash/shorts/nao-existe');
  check('detalhe 404: status 404', detailNf.res.status === 404, `got ${detailNf.res.status}`);
  check('detalhe 404: data = null', detailNf.body?.data === null);
  check('detalhe 404: error.code = NOT_FOUND', detailNf.body?.error?.code === 'NOT_FOUND');
  check('detalhe 404: error.message não vazio', isNonEmptyString(detailNf.body?.error?.message));
  check('detalhe 404: telemetria presente (mesmo em erro)', hasTelemetry(detailNf.body?.meta));
  check('detalhe 404: Content-Type utf-8', isJsonUtf8(detailNf.res));

  report();
}

main().catch((err) => {
  console.error(`\nErro ao executar smoke: ${err?.message ?? err}`);
  console.error(`A API está rodando em ${BASE_URL}? (npm run dev:backend)`);
  process.exit(2);
});
