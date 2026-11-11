#!/usr/bin/env node
/**
 * QA/Demo — Track D. Smoke de contrato do Bate-Papo UOL Next-Gen.
 *
 * Cenários: 4.1 (listagem de salas com lotação "35/40" + envelope
 * `{ data, meta }` com latencyMs/contract/traceId em tudo, inclusive erro),
 * 4.2 (entrada: 200 com nick em participants/online incrementado + 400
 * apelido em uso/inválido + 404 sala), 4.3 (presença por TTL: nick some de
 * participants após >10s sem sinal), 4.4 (envio: 201 no feed + 400 ação
 * inválida/reservada para Todos/destinatário ausente/texto fora de 1–500 +
 * 404 sala), 4.5 (reservadas visíveis só ao par autor/destinatário),
 * 4.6 (reação: 200 incrementado + 400 emoji fora do set + 404 mensagem) e
 * 5.2 (saída explícita `/leave`: remove a presença na hora + idempotência +
 * 404 sala / 400 sem nick + reentrada com o mesmo apelido sem conflito).
 *
 * Uso: node qa/scripts/chat-smoke.mjs   (BASE_URL opcional, default :3001)
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

const ACTIONS = ['fala para', 'grita com', 'sussurra para', 'concorda com'];
const EMOJIS = ['👍', '😂', '❤️'];

function hasRoomShape(r) {
  return (
    r &&
    isNonEmptyString(r.id) &&
    isNonEmptyString(r.name) &&
    isNonEmptyString(r.topic) &&
    isInt(r.online) &&
    r.online >= 0 &&
    isInt(r.capacity) &&
    r.capacity > 0 &&
    r.online <= r.capacity &&
    /^#[0-9a-fA-F]{6}$/.test(r.color) &&
    isNonEmptyString(r.createdAt)
  );
}

function hasMessageShape(m) {
  return (
    m &&
    isNonEmptyString(m.id) &&
    isNonEmptyString(m.roomId) &&
    isNonEmptyString(m.author) &&
    ACTIONS.includes(m.action) &&
    isNonEmptyString(m.recipient) &&
    isNonEmptyString(m.text) &&
    typeof m.isPrivate === 'boolean' &&
    m.reactions !== null &&
    typeof m.reactions === 'object' &&
    EMOJIS.every((e) => isInt(m.reactions[e]) && m.reactions[e] >= 0) &&
    isNonEmptyString(m.createdAt)
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
  console.log('Contrato do Bate-Papo UOL Next-Gen verificado.\n');
}

async function main() {
  console.log(`\n[4.1..4.6, 5.2] Smoke do Bate-Papo UOL Next-Gen — ${BASE_URL}\n`);

  // --- 4.1 listagem de salas: lotação + envelope em tudo ---
  console.log('4.1 GET /api/chat/rooms (lotação + envelope)');
  const rooms = await req('/api/chat/rooms');
  check('salas: status 200', rooms.res.status === 200, `got ${rooms.res.status}`);
  check('salas: Content-Type utf-8', isJsonUtf8(rooms.res));
  check('salas: telemetria completa', hasTelemetry(rooms.body?.meta));
  const roomList = rooms.body?.data ?? [];
  check('salas: 4 salas seed', Array.isArray(roomList) && roomList.length === 4, `length ${roomList.length}`);
  check('salas: cada sala tem forma completa do contrato', roomList.every(hasRoomShape));

  const byId = Object.fromEntries(roomList.map((r) => [r.id, r]));
  check(
    'salas: lotação correta (35/40, 12/40, 27/40, 18/40)',
    byId.arquibancada?.online === 35 && byId.arquibancada?.capacity === 40 &&
      byId['devs-opencode']?.online === 12 && byId['devs-opencode']?.capacity === 40 &&
      byId.paquera?.online === 27 && byId.paquera?.capacity === 40 &&
      byId.splash?.online === 18 && byId.splash?.capacity === 40,
    JSON.stringify(Object.fromEntries(roomList.map((r) => [r.id, `${r.online}/${r.capacity}`]))),
  );
  check(
    'salas: cores de editoria por sala (azul/roxo/laranja/vermelho)',
    byId.arquibancada?.color === '#005FFF' && byId['devs-opencode']?.color === '#6A1B9A' &&
      byId.paquera?.color === '#ED5709' && byId.splash?.color === '#CB0003',
  );
  check(
    'salas: tópico ao vivo presente',
    roomList.every((r) => isNonEmptyString(r.topic)),
  );

  const feedNf = await req('/api/chat/rooms/nao-existe/messages');
  check('404 sala: status 404', feedNf.res.status === 404, `got ${feedNf.res.status}`);
  check('404 sala: data null + NOT_FOUND', feedNf.body?.data === null && feedNf.body?.error?.code === 'NOT_FOUND');
  check('404 sala: telemetria presente (mesmo em erro)', hasTelemetry(feedNf.body?.meta));

  // --- 4.2 entrada: 200 / 400 apelido em uso ou inválido / 404 sala ---
  console.log('\n4.2 POST /api/chat/rooms/:id/enter');
  const qaNick = `qa_smoke_${Date.now() % 100000}`;
  const enter = await post('/api/chat/rooms/arquibancada/enter', { nick: qaNick });
  check('entrada: status 200', enter.res.status === 200, `got ${enter.res.status}`);
  check(
    'entrada: roomId/nick/online/participants',
    enter.body?.data?.roomId === 'arquibancada' && enter.body?.data?.nick === qaNick &&
      isInt(enter.body?.data?.online) && Array.isArray(enter.body?.data?.participants),
  );
  check('entrada: nick incluído em participants', enter.body?.data?.participants?.includes(qaNick));
  check('entrada: online incrementado (36)', enter.body?.data?.online === 36, `online ${enter.body?.data?.online}`);
  check('entrada: telemetria completa', hasTelemetry(enter.body?.meta));

  const taken = await post('/api/chat/rooms/arquibancada/enter', { nick: 'palmeiras_10' });
  check('entrada 400 (apelido em uso): status 400', taken.res.status === 400, `got ${taken.res.status}`);
  check('entrada 400 (em uso): BAD_REQUEST + data null', taken.body?.data === null && taken.body?.error?.code === 'BAD_REQUEST');
  check('entrada 400 (em uso): telemetria presente', hasTelemetry(taken.body?.meta));

  const invalid = await post('/api/chat/rooms/arquibancada/enter', { nick: 'x!' });
  check('entrada 400 (apelido inválido): status 400', invalid.res.status === 400, `got ${invalid.res.status}`);
  check('entrada 400 (inválido): BAD_REQUEST', invalid.body?.error?.code === 'BAD_REQUEST');

  const enterNf = await post('/api/chat/rooms/nao-existe/enter', { nick: qaNick });
  check('entrada 404 (sala inexistente): status 404', enterNf.res.status === 404, `got ${enterNf.res.status}`);
  check('entrada 404: NOT_FOUND + data null', enterNf.body?.data === null && enterNf.body?.error?.code === 'NOT_FOUND');
  check('entrada 404: telemetria presente', hasTelemetry(enterNf.body?.meta));

  // --- 4.4 envio: 201 aparece no feed + 400s + 404 ---
  console.log('\n4.4 POST /api/chat/rooms/:id/messages');
  const sendPayload = {
    author: qaNick,
    action: 'grita com',
    recipient: 'Todos',
    text: 'GOL NO ÚLTIMO MINUTO DO SMOKE!!!',
    isPrivate: false,
  };
  const created = await post('/api/chat/rooms/arquibancada/messages', sendPayload);
  check('envio: status 201', created.res.status === 201, `got ${created.res.status}`);
  check('envio: mensagem criada com forma completa', hasMessageShape(created.body?.data));
  check('envio: id/createdAt pelo servidor', isNonEmptyString(created.body?.data?.id) && isNonEmptyString(created.body?.data?.createdAt));
  check(
    'envio: reactions zerado no set canônico',
    EMOJIS.every((e) => created.body?.data?.reactions?.[e] === 0),
  );
  check('envio: telemetria completa', hasTelemetry(created.body?.meta));

  const afterSend = await req(`/api/chat/rooms/arquibancada/messages?nick=${qaNick}`);
  check(
    'envio: mensagem aparece na listagem',
    (afterSend.body?.data?.messages ?? []).some((m) => m.id === created.body?.data?.id),
  );
  check(
    'feed: ordem createdAt ascendente',
    (afterSend.body?.data?.messages ?? []).every((m, i, arr) => i === 0 || Date.parse(arr[i - 1].createdAt) <= Date.parse(m.createdAt)),
  );
  check(
    'feed: participantes piggyback inclui o nick',
    (afterSend.body?.data?.participants ?? []).includes(qaNick),
  );

  const limited = await req(`/api/chat/rooms/arquibancada/messages?limit=2`);
  check('feed: limit=2 devolve as últimas 2', (limited.body?.data?.messages ?? []).length === 2);

  const badAction = await post('/api/chat/rooms/arquibancada/messages', { ...sendPayload, action: 'murmura para' });
  check('envio 400 (ação fora do enum): status 400', badAction.res.status === 400, `got ${badAction.res.status}`);
  check('envio 400 (ação): BAD_REQUEST + data null', badAction.body?.data === null && badAction.body?.error?.code === 'BAD_REQUEST');
  check('envio 400 (ação): telemetria presente', hasTelemetry(badAction.body?.meta));

  const privateTodos = await post('/api/chat/rooms/paquera/messages', {
    author: 'romantico_sp', action: 'sussurra para', recipient: 'Todos', text: 'psst...', isPrivate: true,
  });
  check('envio 400 (reservada para Todos): status 400', privateTodos.res.status === 400, `got ${privateTodos.res.status}`);
  check('envio 400 (reservada): BAD_REQUEST', privateTodos.body?.error?.code === 'BAD_REQUEST');

  const badRecipient = await post('/api/chat/rooms/arquibancada/messages', { ...sendPayload, recipient: 'nao_estou_aqui' });
  check('envio 400 (destinatário ausente): status 400', badRecipient.res.status === 400, `got ${badRecipient.res.status}`);

  const emptyText = await post('/api/chat/rooms/arquibancada/messages', { ...sendPayload, text: '   ' });
  check('envio 400 (texto vazio após trim): status 400', emptyText.res.status === 400, `got ${emptyText.res.status}`);

  const longText = await post('/api/chat/rooms/arquibancada/messages', { ...sendPayload, text: 'a'.repeat(501) });
  check('envio 400 (texto > 500): status 400', longText.res.status === 400, `got ${longText.res.status}`);

  const badAuthor = await post('/api/chat/rooms/arquibancada/messages', { ...sendPayload, author: 'nick inválido!' });
  check('envio 400 (author fora da regex): status 400', badAuthor.res.status === 400, `got ${badAuthor.res.status}`);

  const sendNf = await post('/api/chat/rooms/nao-existe/messages', sendPayload);
  check('envio 404 (sala inexistente): status 404', sendNf.res.status === 404, `got ${sendNf.res.status}`);
  check('envio 404: NOT_FOUND + telemetria', sendNf.body?.error?.code === 'NOT_FOUND' && hasTelemetry(sendNf.body?.meta));

  // --- 4.5 reservadas visíveis só ao par autor/destinatário ---
  console.log('\n4.5 GET /messages?nick= (filtro de reservadas no servidor)');
  const asAuthor = await req('/api/chat/rooms/paquera/messages?nick=solitaria_99');
  check(
    'reservada: autor a vê',
    (asAuthor.body?.data?.messages ?? []).some((m) => m.isPrivate && m.author === 'solitaria_99'),
  );
  const asRecipient = await req('/api/chat/rooms/paquera/messages?nick=romantico_sp');
  check(
    'reservada: destinatário a vê',
    (asRecipient.body?.data?.messages ?? []).some((m) => m.isPrivate && m.recipient === 'romantico_sp'),
  );
  const asThird = await req('/api/chat/rooms/paquera/messages?nick=gata_sp_98');
  check(
    'reservada: terceiro NÃO a vê',
    (asThird.body?.data?.messages ?? []).every((m) => !m.isPrivate),
  );
  const asSpectator = await req('/api/chat/rooms/paquera/messages');
  check(
    'reservada: sem ?nick= nenhuma reservada vaza',
    (asSpectator.body?.data?.messages ?? []).every((m) => !m.isPrivate),
  );

  // Reservada dinâmica: QA entra na paquera e sussurra para um nick do seed.
  const qaPaquera = `qa_pq_${Date.now() % 100000}`;
  await post('/api/chat/rooms/paquera/enter', { nick: qaPaquera });
  const whisper = await post('/api/chat/rooms/paquera/messages', {
    author: qaPaquera, action: 'sussurra para', recipient: 'romantico_sp',
    text: 'psst... smoke reservado', isPrivate: true,
  });
  check('reservada dinâmica: 201 no envio', whisper.res.status === 201, `got ${whisper.res.status}`);
  const pairView = await req(`/api/chat/rooms/paquera/messages?nick=${qaPaquera}`);
  check(
    'reservada dinâmica: par (autor) a vê',
    (pairView.body?.data?.messages ?? []).some((m) => m.id === whisper.body?.data?.id),
  );
  const thirdView = await req('/api/chat/rooms/paquera/messages?nick=morena_paulista');
  check(
    'reservada dinâmica: terceiro não a vê',
    (thirdView.body?.data?.messages ?? []).every((m) => m.id !== whisper.body?.data?.id),
  );

  // --- 4.6 reações: 200 incrementado + 400 emoji + 404 mensagem ---
  console.log('\n4.6 POST /api/chat/messages/:id/react');
  const target = await req('/api/chat/rooms/paquera/messages?nick=gata_sp_98');
  const targetMessage = (target.body?.data?.messages ?? []).find((m) => m.author === 'gata_sp_98');
  check('reação: mensagem-alvo existe no seed', Boolean(targetMessage));
  const before = targetMessage?.reactions?.['😂'] ?? 0;
  const react = await post(`/api/chat/messages/${targetMessage?.id ?? 'x'}/react`, { emoji: '😂' });
  check('reação: status 200', react.res.status === 200, `got ${react.res.status}`);
  check('reação: mensagem com forma completa', hasMessageShape(react.body?.data));
  check(
    'reação: contador de 😂 incrementado',
    react.body?.data?.reactions?.['😂'] === before + 1,
    `count ${react.body?.data?.reactions?.['😂']} vs before+1 ${before + 1}`,
  );
  check('reação: telemetria completa', hasTelemetry(react.body?.meta));

  const badEmoji = await post(`/api/chat/messages/${targetMessage?.id ?? 'x'}/react`, { emoji: '🎉' });
  check('reação 400 (emoji fora do set): status 400', badEmoji.res.status === 400, `got ${badEmoji.res.status}`);
  check('reação 400: BAD_REQUEST + data null', badEmoji.body?.data === null && badEmoji.body?.error?.code === 'BAD_REQUEST');
  check('reação 400: telemetria presente', hasTelemetry(badEmoji.body?.meta));

  const reactNf = await post('/api/chat/messages/nao-existe/react', { emoji: '👍' });
  check('reação 404 (mensagem inexistente): status 404', reactNf.res.status === 404, `got ${reactNf.res.status}`);
  check('reação 404: NOT_FOUND + data null', reactNf.body?.data === null && reactNf.body?.error?.code === 'NOT_FOUND');
  check('reação 404: telemetria presente', hasTelemetry(reactNf.body?.meta));

  // --- 4.3 presença por TTL: nick some após >10s sem sinal ---
  console.log('\n4.3 Presença por TTL (aguardando ~11s sem sinal de vida…)');
  const ttlNick = `qa_ttl_${Date.now() % 100000}`;
  const ttlEnter = await post('/api/chat/rooms/splash/enter', { nick: ttlNick });
  check('TTL: entrada 200 com online 19', ttlEnter.res.status === 200 && ttlEnter.body?.data?.online === 19, `online ${ttlEnter.body?.data?.online}`);
  check(
    'TTL: nick presente em participants logo após entrar',
    ttlEnter.body?.data?.participants?.includes(ttlNick),
  );

  await new Promise((resolve) => setTimeout(resolve, 11_000));

  const ttlAfter = await req(`/api/chat/rooms/splash/messages?nick=${ttlNick}`);
  check(
    'TTL: nick SOME de participants após >10s sem sinal',
    !(ttlAfter.body?.data?.participants ?? []).includes(ttlNick),
  );
  check(
    'TTL: online da sala decresce de volta a 18',
    (ttlAfter.body?.data?.participants ?? []).length === 18,
    `participants ${ttlAfter.body?.data?.participants?.length}`,
  );
  const roomsAfterTtl = await req('/api/chat/rooms');
  const splashAfter = (roomsAfterTtl.body?.data ?? []).find((r) => r.id === 'splash');
  check('TTL: GET /rooms reflete o online decrescido (18/40)', splashAfter?.online === 18, `online ${splashAfter?.online}`);
  check('TTL: telemetria completa na re-listagem', hasTelemetry(roomsAfterTtl.body?.meta));

  // --- 5.2 saída explícita: /leave remove na hora + idempotente + 404/400 ---
  console.log('\n5.2 POST /api/chat/rooms/:id/leave');
  const leaveNick = `qa_leave_${Date.now() % 100000}`;
  const leaveEnter = await post('/api/chat/rooms/devs-opencode/enter', { nick: leaveNick });
  check(
    'saída: entrada 200 com online 13',
    leaveEnter.res.status === 200 && leaveEnter.body?.data?.online === 13,
    `online ${leaveEnter.body?.data?.online}`,
  );
  check('saída: nick presente antes de sair', leaveEnter.body?.data?.participants?.includes(leaveNick));

  const left = await post('/api/chat/rooms/devs-opencode/leave', { nick: leaveNick });
  check('saída: status 200', left.res.status === 200, `got ${left.res.status}`);
  check('saída: nick ausente de participants', !(left.body?.data?.participants ?? []).includes(leaveNick));
  check('saída: online decrementado (12)', left.body?.data?.online === 12, `online ${left.body?.data?.online}`);
  check('saída: telemetria completa', hasTelemetry(left.body?.meta));

  const leftAgain = await post('/api/chat/rooms/devs-opencode/leave', { nick: leaveNick });
  check(
    'saída: idempotente (200, online inalterado)',
    leftAgain.res.status === 200 && leftAgain.body?.data?.online === 12,
    `online ${leftAgain.body?.data?.online}`,
  );

  const leaveBad = await post('/api/chat/rooms/devs-opencode/leave', {});
  check('saída 400 (sem nick): status 400', leaveBad.res.status === 400, `got ${leaveBad.res.status}`);
  check('saída 400: BAD_REQUEST + data null', leaveBad.body?.data === null && leaveBad.body?.error?.code === 'BAD_REQUEST');
  check('saída 400: telemetria presente', hasTelemetry(leaveBad.body?.meta));

  const leaveNf = await post('/api/chat/rooms/nao-existe/leave', { nick: leaveNick });
  check('saída 404 (sala inexistente): status 404', leaveNf.res.status === 404, `got ${leaveNf.res.status}`);
  check('saída 404: NOT_FOUND + data null', leaveNf.body?.data === null && leaveNf.body?.error?.code === 'NOT_FOUND');
  check('saída 404: telemetria presente', hasTelemetry(leaveNf.body?.meta));

  // Saída removeu a presença: reentrar com o mesmo apelido não dá conflito.
  const reenter = await post('/api/chat/rooms/devs-opencode/enter', { nick: leaveNick });
  check('saída: reentrada com o mesmo nick não dá 400 de apelido em uso', reenter.res.status === 200, `got ${reenter.res.status}`);
  await post('/api/chat/rooms/devs-opencode/leave', { nick: leaveNick });

  report();
}

main().catch((err) => {
  console.error(`\nErro ao executar smoke: ${err?.message ?? err}`);
  console.error(`A API está rodando em ${BASE_URL}? (npm run dev:backend)`);
  process.exit(2);
});
