#!/usr/bin/env node
/**
 * QA/Demo — Track D. Contraste AA da foundation (cenário 4.2).
 *
 * Lê os tokens reais de frontend/src/styles/tokens.css, calcula as razões de
 * contraste WCAG 2.1 e valida AA (>= 4.5:1) em light e dark, incluindo a regra
 * dura amarelo (#FFCE00) com texto PRETO.
 *
 * Uso: node qa/scripts/contrast.mjs   (sai != 0 em falha)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, '../../frontend/src/styles/tokens.css');
const AA = 4.5;

const css = readFileSync(TOKENS_PATH, 'utf8');

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

const light = tokensFrom(block(':root'));
const dark = tokensFrom(block("[data-theme='dark']"));

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

const get = (t, name) => {
  const v = t[name];
  if (!v) throw new Error(`token ausente: ${name}`);
  return v;
};

const PAIRS = [
  // tema, rótulo, fg, bg
  ['light', 'corpo sobre fundo', get(light, '--text'), get(light, '--bg')],
  ['light', 'corpo sobre superfície', get(light, '--text'), get(light, '--surface')],
  ['light', 'muted sobre fundo', get(light, '--muted'), get(light, '--bg')],
  ['light', 'preto sobre amarelo (regra dura)', '#000000', get(light, '--uol-yellow')],
  ['light', 'branco sobre vermelho de ação', '#ffffff', get(light, '--uol-red')],
  ['dark', 'corpo sobre fundo', get(dark, '--text'), get(dark, '--bg')],
  ['dark', 'corpo sobre superfície', get(dark, '--text'), get(dark, '--surface')],
  ['dark', 'muted sobre fundo', get(dark, '--muted'), get(dark, '--bg')],
];

let failed = 0;
console.log(`\n[4.2] Contraste AA (>= ${AA}:1) — ${TOKENS_PATH}\n`);
for (const [theme, label, fg, bg] of PAIRS) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= AA;
  if (!ok) failed += 1;
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'}  [${theme}] ${label.padEnd(38)} ${fg} on ${bg} = ${ratio.toFixed(2)}:1`,
  );
}

// Regra dura negativa: branco sobre amarelo DEVE falhar AA (prova a regra).
const whiteOnYellow = contrast('#ffffff', get(light, '--uol-yellow'));
console.log(
  `\n  INFO  branco sobre amarelo (proibido) = ${whiteOnYellow.toFixed(2)}:1 (abaixo de AA, como esperado)`,
);

console.log(`\nResultado: ${PAIRS.length - failed} PASS · ${failed} FAIL`);
if (failed > 0) {
  console.log('\nContraste AA reprovado.');
  process.exit(1);
}
console.log('Contraste AA aprovado em dark e light.\n');
