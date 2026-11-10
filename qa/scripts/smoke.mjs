#!/usr/bin/env node
/**
 * QA/Demo — Track D. Smoke de contrato da foundation (cenários 4.1 e 4.3).
 *
 * Uso: node qa/scripts/smoke.mjs   (BASE_URL opcional, default http://localhost:3001)
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
const isIsoDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const hasTelemetry = (meta) =>
  meta &&
  isInt(meta.latencyMs) &&
  meta.latencyMs >= 0 &&
  meta.contract === 'v1' &&
  isNonEmptyString(meta.traceId) &&
  isIsoDate(meta.ts);

async function get(path, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

async function main() {
  console.log(`\n[4.1 | 4.3] Smoke de contrato — ${BASE_URL}\n`);

  // --- 4.3 /health + charset + CORS ---
  console.log('GET /health');
  const health = await get('/health');
  const ct = health.res.headers.get('content-type') ?? '';
  check('health: status 200', health.res.status === 200, `got ${health.res.status}`);
  check('health: Content-Type utf-8', ct === 'application/json; charset=utf-8', ct);
  check(
    'health: Access-Control-Allow-Origin *',
    health.res.headers.get('access-control-allow-origin') === '*',
    health.res.headers.get('access-control-allow-origin'),
  );
  check('health: data.status = ok', health.body?.data?.status === 'ok');
  check(
    'health: data.uptimeMs inteiro >= 0',
    isInt(health.body?.data?.uptimeMs) && health.body.data.uptimeMs >= 0,
    String(health.body?.data?.uptimeMs),
  );
  check('health: data.version = v1', health.body?.data?.version === 'v1');
  check('health: envelope tem data e meta', 'data' in (health.body ?? {}) && 'meta' in (health.body ?? {}));
  check('health: telemetria completa', hasTelemetry(health.body?.meta));

  // --- 4.1 envelope em erro (404) + 4.3 ---
  console.log('\nGET /api/portal/articles/inexistente');
  const notFound = await get('/api/portal/articles/inexistente');
  const ct404 = notFound.res.headers.get('content-type') ?? '';
  check('404: status 404', notFound.res.status === 404, `got ${notFound.res.status}`);
  check('404: Content-Type utf-8', ct404 === 'application/json; charset=utf-8', ct404);
  check('404: data = null', notFound.body?.data === null);
  check('404: error.code = NOT_FOUND', notFound.body?.error?.code === 'NOT_FOUND');
  check('404: error.message não vazio', isNonEmptyString(notFound.body?.error?.message));
  check('404: telemetria completa (presente em erro)', hasTelemetry(notFound.body?.meta));

  // --- 4.1 traceId único + eco de x-trace-id ---
  console.log('\nCorrelação por traceId');
  const a = await get('/health');
  const b = await get('/health');
  check(
    'traceId único por requisição',
    isNonEmptyString(a.body?.meta?.traceId) && a.body.meta.traceId !== b.body?.meta?.traceId,
  );
  const custom = 'smoke-trace-0001';
  const echoed = await get('/health', { 'x-trace-id': custom });
  check('traceId reusa x-trace-id do cliente', echoed.body?.meta?.traceId === custom, echoed.body?.meta?.traceId);

  // --- 4.3 CORS preflight ---
  console.log('\nOPTIONS /api/portal/highlights (preflight)');
  const pre = await fetch(`${BASE_URL}/api/portal/highlights`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'GET' },
  });
  check('preflight: status ok', pre.status === 204 || pre.status === 200, `got ${pre.status}`);
  check(
    'preflight: Access-Control-Allow-Origin *',
    pre.headers.get('access-control-allow-origin') === '*',
  );

  console.log(`\nResultado: ${passed} PASS · ${failures.length} FAIL`);
  if (failures.length > 0) {
    console.log('\nFalhas:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('Contrato da foundation verificado.\n');
}

main().catch((err) => {
  console.error(`\nErro ao executar smoke: ${err?.message ?? err}`);
  console.error(`A API está rodando em ${BASE_URL}? (npm run dev:backend)`);
  process.exit(2);
});
