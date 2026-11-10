#!/usr/bin/env node
/**
 * QA/Demo — Track D. Acessibilidade AA + `aria-live` (cenário 4.5).
 *
 * Verificações:
 *  - contraste mínimo AA (>= 4.5:1) em dark e light nos tokens reais;
 *  - região de polling com `aria-live="polite"` na `Home`;
 *  - erros críticos com `role="alert"` e controle de busca rotulado;
 *  - regra dura: texto preto sobre amarelo (nunca branco).
 *
 * Uso: node qa/scripts/portal-a11y.mjs   (sai != 0 em falha)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../frontend/src');

let failed = 0;
function check(name, condition, detail) {
  if (!condition) failed += 1;
  console.log(`  ${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

// ---- Contraste a partir dos tokens reais ----
const css = readFileSync(resolve(SRC, 'styles/tokens.css'), 'utf8');

function block(selector) {
  const idx = css.indexOf(selector);
  if (idx === -1) throw new Error(`selector não encontrado: ${selector}`);
  const open = css.indexOf('{', idx);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}
function tokensFrom(text) {
  const out = {};
  const re = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
  let m;
  while ((m = re.exec(text)) !== null) out[m[1]] = m[2].toLowerCase();
  return out;
}
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const light = tokensFrom(block(':root'));
const dark = tokensFrom(block("[data-theme='dark']"));
const AA = 4.5;

console.log(`\n[4.5] Acessibilidade AA + aria-live\n`);
console.log('Contraste (dark e light)');
const pairs = [
  ['light', 'texto sobre fundo', light['--text'], light['--bg']],
  ['light', 'texto sobre superfície', light['--text'], light['--surface']],
  ['dark', 'texto sobre fundo', dark['--text'], dark['--bg']],
  ['dark', 'texto sobre superfície', dark['--text'], dark['--surface']],
  ['light', 'preto sobre amarelo (regra dura)', '#000000', light['--uol-yellow']],
  ['light', 'branco sobre vermelho', '#ffffff', light['--uol-red']],
];
for (const [theme, label, fg, bg] of pairs) {
  const ratio = contrast(fg, bg);
  check(`[${theme}] ${label} (${ratio.toFixed(2)}:1)`, ratio >= AA);
}

console.log('\nARIA e marcação');
const home = readFileSync(resolve(SRC, 'pages/HomePage.tsx'), 'utf8');
const stateViews = readFileSync(resolve(SRC, 'components/StateViews.tsx'), 'utf8');
const searchBar = readFileSync(resolve(SRC, 'components/SearchBar.tsx'), 'utf8');
const usePolling = readFileSync(resolve(SRC, 'lib/usePolling.ts'), 'utf8');

check('Home: região de polling com aria-live="polite"', home.includes('aria-live="polite"'));
check('Erros: role="alert" no estado de erro', stateViews.includes('role="alert"'));
check('Busca: input rotulado (sr-only/aria)', searchBar.includes('sr-only') && searchBar.includes('htmlFor'));
check('Polling: cleanup com visibilitychange/clearInterval', usePolling.includes('visibilitychange') && usePolling.includes('clearInterval'));
check('Polling: sem setState após unmount (guarda alive)', usePolling.includes('aliveRef'));

console.log(`\nResultado: ${failed === 0 ? 'PASS' : `${failed} FAIL`}`);
if (failed > 0) {
  console.log('\nAcessibilidade reprovada.');
  process.exit(1);
}
console.log('Acessibilidade AA + aria-live aprovados.\n');
