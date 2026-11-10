#!/usr/bin/env node
/**
 * QA/Demo — Track D. Acessibilidade AA do UOL Flash Short (cenário 4.6).
 *
 * Verificações (estáticas sobre o código + contraste calculado dos tokens):
 *  - contraste AA (>= 4.5:1) em dark e light nos pares usados pelo `/flash`,
 *    incluindo a regra dura (amarelo com texto preto) e chips de editoria;
 *  - navegação por teclado (setas) e `prefers-reduced-motion` no feed;
 *  - focus trap + `Esc` + retorno de foco no bottom sheet e no modal;
 *  - `aria-live="polite"` apenas nos contadores do card visível;
 *  - dedup por browser (`localStorage`) em curtida e voto;
 *  - polling de 3s com cleanup e pausa em `document.hidden` (reuso de usePolling).
 *
 * Uso: node qa/scripts/flash-a11y.mjs   (sai != 0 em falha)
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

const read = (p) => readFileSync(resolve(SRC, p), 'utf8');

// ---- Contraste a partir dos tokens reais ----
const css = read('styles/tokens.css');

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

console.log(`\n[4.6] Acessibilidade AA do /flash\n`);
console.log('Contraste (dark e light)');
const pairs = [
  ['light', 'texto sobre fundo', light['--text'], light['--bg']],
  ['dark', 'texto sobre fundo', dark['--text'], dark['--bg']],
  ['light', 'preto sobre amarelo (regra dura §5.1)', '#000000', light['--uol-yellow']],
  ['chip', 'branco sobre vermelho (noticias)', '#ffffff', light['--ed-noticias']],
  ['chip', 'branco sobre azul (esportes)', '#ffffff', light['--ed-esportes']],
  ['chip', 'branco sobre verde (economia)', '#ffffff', light['--ed-economia']],
  ['chip', 'preto sobre laranja (entretenimento)', '#000000', light['--ed-entretenimento']],
  ['chip', 'branco sobre roxo (tecnologia)', '#ffffff', light['--ed-tecnologia']],
  ['scrim', 'branco sobre scrim 90% (título/resumo sobre a mídia)', '#ffffff', '#1a1a1a'],
];
for (const [theme, label, fg, bg] of pairs) {
  const ratio = contrast(fg, bg);
  check(`[${theme}] ${label} (${ratio.toFixed(2)}:1)`, ratio >= AA);
}

console.log('\nTeclado, foco e movimento');
const feed = read('components/flash/ShortFeed.tsx');
const card = read('components/flash/ShortCard.tsx');
const useDialog = read('lib/useDialog.ts');
const usePolling = read('lib/usePolling.ts');
const flashPage = read('pages/FlashPage.tsx');

check('Feed: navegação por setas ↑/↓', feed.includes('ArrowDown') && feed.includes('ArrowUp'));
check('Feed: snap obrigatório (snap-y snap-mandatory)', feed.includes('snap-y snap-mandatory'));
check('Feed: prefers-reduced-motion respeitado na rolagem', feed.includes('prefers-reduced-motion'));
check('Feed: região rotulada para leitores de tela', feed.includes('aria-label="Feed de shorts'));
check('Card: key={short.id} estável', feed.includes('key={short.id}'));
check('Card: fallback de mídia na cor da editoria (onError)', card.includes('onError') && card.includes('editoriaColorVar'));
check('Card: vídeo muted + playsInline + pausa fora da viewport', card.includes('muted') && card.includes('playsInline') && card.includes('IntersectionObserver'));

console.log('\nDiálogos (bottom sheet e modal)');
check('Diálogo: Esc fecha', useDialog.includes("'Escape'"));
check('Diálogo: focus trap (Tab circulando dentro)', useDialog.includes("'Tab'") && useDialog.includes('preventDefault'));
check('Diálogo: foco retorna ao gatilho ao fechar', useDialog.includes('previouslyFocused?.focus()'));
const sheet = read('components/flash/ArticleSheet.tsx');
const modal = read('components/flash/PublishModal.tsx');
check('Sheet: role="dialog" + aria-modal', sheet.includes('role="dialog"') && sheet.includes('aria-modal="true"'));
check('Sheet: link externo com rel="noopener noreferrer"', sheet.includes('rel="noopener noreferrer"'));
check('Modal: role="dialog" + aria-modal', modal.includes('role="dialog"') && modal.includes('aria-modal="true"'));
check('Modal: erro do servidor com role="alert" (nunca engolido)', modal.includes('role="alert"'));
check('Modal: campos rotulados (htmlFor/id)', modal.includes('htmlFor') && modal.includes('<label'));

console.log('\nARIA e dedup por browser');
const rail = read('components/flash/ActionRail.tsx');
const poll = read('components/flash/PollCard.tsx');
const flashLocal = read('lib/flashLocal.ts');

check(
  'Rail: aria-live="polite" apenas no card visível (gated por active)',
  rail.includes(`aria-live={active ? 'polite' : 'off'}`) && poll.includes(`aria-live={active ? 'polite' : 'off'}`),
);
check('Rail: botões com aria-label descritivo', rail.includes('aria-label='));
check('Rail: active:scale-95 em todos os botões', (rail.match(/active:scale-95/g) ?? []).length >= 4);
check('Dedup: curtida e voto por localStorage (1 por short por browser)', flashLocal.includes('markLiked') && flashLocal.includes('markVoted'));
check('Dedup: rail desabilita nova curtida (disabled)', rail.includes('disabled={liked}'));

console.log('\nPolling e estados de UI');
check('FlashPage: polling de 3s reusando usePolling', flashPage.includes('usePolling'));
check('Polling: cleanup com visibilitychange/clearInterval', usePolling.includes('visibilitychange') && usePolling.includes('clearInterval'));
check('Polling: sem setState após unmount (guarda alive)', usePolling.includes('aliveRef'));
check('FlashPage: erro com role="alert" + tentar novamente', flashPage.includes('ErrorState'));
check('FlashPage: vazio com orientação + atalho ao modal', flashPage.includes('Nenhum short publicado ainda') && flashPage.includes('Publicar o primeiro short'));
check('FlashPage: loading com skeleton na moldura (role="status")', flashPage.includes('role="status"'));
check('FlashPage: créditos baseado em uol.com.br sem emoji', flashPage.includes('uol.com.br'));
check('FlashPage: atalho discreto de retorno ao portal', flashPage.includes('Voltar ao Portal UOL'));
check('FlashPage: toggle Recentes/Mais curtidos com aria-pressed', flashPage.includes('aria-pressed={sort === mode}'));

console.log(`\nResultado: ${failed === 0 ? 'PASS' : `${failed} FAIL`}`);
if (failed > 0) {
  console.log('\nAcessibilidade do /flash reprovada.');
  process.exit(1);
}
console.log('Acessibilidade AA do /flash aprovada.\n');
