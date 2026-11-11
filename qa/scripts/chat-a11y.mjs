#!/usr/bin/env node
/**
 * QA/Demo — Track D. Acessibilidade AA do Bate-Papo UOL Next-Gen (cenários 4.7/4.8).
 *
 * Verificações (estáticas sobre o código + contraste calculado dos tokens):
 *  - contraste AA (>= 4.5:1) em dark e light nos pares usados pelo `/bate-papo`,
 *    incluindo a regra dura (amarelo com texto preto) e os tons de texto em cor
 *    de marca (vermelho do grito / azul do "concorda com") em ambos os temas;
 *  - feed com `role="log"` e `aria-live="polite"` no contador de online;
 *  - focus trap + `Esc` + retorno de foco no modal de entrada (reuso useDialog);
 *  - teclado no composer (form/Enter) e bloqueio client-side espelhando o `400`;
 *  - dedup por browser (`localStorage`) em reações e nick salvo p/ re-entrada;
 *  - 2 pollers de 3s com cleanup e pausa em `document.hidden` (reuso usePolling);
 *  - re-entrada automática ao retomar o foco quando o nick expirou por TTL;
 *  - mobile: colunas colapsáveis com `aria-expanded`/`aria-controls`.
 *
 * Uso: node qa/scripts/chat-a11y.mjs   (sai != 0 em falha)
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

console.log(`\n[4.7/4.8] Acessibilidade AA do /bate-papo\n`);
console.log('Contraste (dark e light)');
const pairs = [
  ['light', 'texto sobre fundo', light['--text'], light['--bg']],
  ['dark', 'texto sobre fundo', dark['--text'], dark['--bg']],
  ['light', 'preto sobre amarelo — reservada (regra dura §5.1)', '#000000', light['--uol-yellow']],
  ['dark', 'preto sobre amarelo — reservada (amarelo é fixo por tema)', '#000000', light['--uol-yellow']],
  ['light', 'grito: vermelho-texto sobre superfície', light['--uol-red-text'], light['--surface']],
  ['dark', 'grito: vermelho-texto sobre superfície', dark['--uol-red-text'], dark['--surface']],
  ['light', 'concorda: azul-texto sobre superfície', light['--uol-blue-text'], light['--surface']],
  ['dark', 'concorda: azul-texto sobre superfície', dark['--uol-blue-text'], dark['--surface']],
  ['light', 'muted (sussurra) sobre superfície', light['--muted'], light['--surface']],
  ['dark', 'muted (sussurra) sobre superfície', dark['--muted'], dark['--surface']],
  ['light', 'preto/80 (timestamp) sobre amarelo', '#333300', light['--uol-yellow']],
];
for (const [theme, label, fg, bg] of pairs) {
  const ratio = contrast(fg, bg);
  check(`[${theme}] ${label} (${ratio.toFixed(2)}:1)`, ratio >= AA);
}

console.log('\nFeed, banner e reações');
const feed = read('components/chat/MessageFeed.tsx');
const page = read('pages/BatePapoPage.tsx');

check('Feed: role="log" (região live polite implícita)', feed.includes('role="log"'));
check('Feed: região rotulada para leitores de tela', feed.includes('aria-label="Mensagens da sala"'));
check('Feed: key={message.id} estável (polling não remonta)', feed.includes('key={message.id}'));
check('Feed: timestamps em JetBrains Mono (font-mono)', feed.includes('font-mono'));
check('Feed: grita com = caixa alta (uppercase)', feed.includes('uppercase'));
check('Feed: grita com = vermelho UOL (token de texto AA)', feed.includes('text-brand-red-text'));
check('Feed: sussurra para = itálico muted', feed.includes('italic') && feed.includes('text-muted'));
check('Feed: concorda com = azul (token de texto AA)', feed.includes('text-brand-blue-text'));
check('Feed: reservada = fundo amarelo + texto preto + badge', feed.includes('bg-brand-yellow') && feed.includes('text-black') && feed.includes('reservada'));
check('Reações: botões com aria-label descritivo', feed.includes('aria-label={`${label}'));
check('Reações: active:scale-95 em todos os botões', (feed.match(/active:scale-95/g) ?? []).length >= 1);
check('Reações: dedup desabilita nova reação (disabled)', feed.includes('disabled={reacted}'));
check('Banner: indicador ao vivo com animate-ping', page.includes('animate-ping'));
check('Banner: tópico da sala exibido', page.includes('activeRoom.topic'));

console.log('\nModal de entrada e teclado');
const modal = read('components/chat/EnterModal.tsx');
const useDialog = read('lib/useDialog.ts');
const composer = read('components/chat/Composer.tsx');

check('Modal: role="dialog" + aria-modal', modal.includes('role="dialog"') && modal.includes('aria-modal="true"'));
check('Modal: erro do servidor (apelido em uso) com role="alert"', modal.includes('role="alert"'));
check('Modal: validação client-side espelhando o 400 (regex do nick)', modal.includes('NICK_REGEX'));
check('Modal: campo rotulado (htmlFor/id)', modal.includes('htmlFor="enter-nick"') && modal.includes('id="enter-nick"'));
check('Modal: nick persistido em localStorage', modal.includes('getSavedNick'));
check('Diálogo: Esc fecha', useDialog.includes("'Escape'"));
check('Diálogo: focus trap (Tab circulando dentro)', useDialog.includes("'Tab'") && useDialog.includes('preventDefault'));
check('Diálogo: foco retorna ao gatilho ao fechar', useDialog.includes('previouslyFocused?.focus()'));
check('Composer: Enter envia (form onSubmit)', composer.includes('onSubmit={handleSubmit}'));
check('Composer: bloqueio client-side de reservada para Todos (mensagem inline)', composer.includes('reservada exige um destinatário') || composer.includes('Reservadamente exige'));
check('Composer: sem nick não há envio (decisão 14)', composer.includes('onOpenEnter'));
check('Composer: active:scale-95', composer.includes('active:scale-95'));

console.log('\nSalas, participantes e navegação');
const roomList = read('components/chat/RoomList.tsx');
const people = read('components/chat/ParticipantsPanel.tsx');
const header = read('components/Header.tsx');
const app = read('App.tsx');

check('Salas: barra de lotação amarela', roomList.includes('var(--uol-yellow)'));
check('Salas: vermelho acima de 80% de lotação', roomList.includes('var(--uol-red)') && roomList.includes('crowded'));
check('Salas: contagem em JetBrains Mono', roomList.includes('font-mono'));
check('Salas: sala ativa destacada na cor da sala', roomList.includes('borderLeftColor: room.color'));
check('Salas: estado pressionado acessível (aria-pressed)', roomList.includes('aria-pressed={active}'));
check('Salas: troca rápida de nick (re-enter)', roomList.includes('trocar apelido'));
check('Participantes: clique = destinatário com aria-label "conversar com {nick}"', people.includes('conversar com ${p}'));
check('Participantes: contador de online com aria-live="polite"', people.includes('aria-live="polite"'));
check('Participantes: nick próprio destacado', people.includes('(você)'));
check('Navegação: link "Bate-Papo" no Header do portal', header.includes('to="/bate-papo"'));
check('Navegação: "voltar ao portal" na barra do chat', page.includes('voltar ao portal'));
check('Navegação: rota /bate-papo fora do Layout (precedente /flash)', app.includes('path="bate-papo"') && app.includes('path="flash"'));

console.log('\nPolling, presença e estados de UI');
const usePolling = read('lib/usePolling.ts');
const chatLocal = read('lib/chatLocal.ts');

check('Polling: 2 pollers de 3s reusando usePolling', (page.match(/usePolling</g) ?? []).length === 2);
check('Polling: cleanup com visibilitychange/clearInterval', usePolling.includes('visibilitychange') && usePolling.includes('clearInterval'));
check('Polling: sem setState após unmount (guarda alive)', usePolling.includes('aliveRef'));
check('Presença: ?nick= no poller do feed (sinal de vida do TTL)', page.includes("params.set('nick', nick)"));
check('Presença: re-entrada automática ao retomar o foco (nick expirado por TTL)', page.includes('awaitingPresenceRef') && page.includes('feed.participants.includes(nick)'));
check('Presença: nick salvo para re-entrada (localStorage)', chatLocal.includes('saveNick') && chatLocal.includes('getSavedNick'));
check('Dedup: 1 reação por emoji por mensagem por browser', chatLocal.includes('markReacted') && chatLocal.includes('hasReacted') && chatLocal.includes('reactedKeys'));
check('Estados: erro com role="alert" + tentar novamente (ErrorState)', page.includes('ErrorState'));
check('Estados: vazio com orientação dedicada', page.includes('Sala silenciosa'));
check('Estados: loading com skeleton por região (role="status")', page.includes('role="status"'));
check('Mobile: seções colapsáveis com aria-expanded/aria-controls', page.includes('aria-expanded') && page.includes('aria-controls'));
check('Créditos: rodapé baseado em uol.com.br sem emoji', page.includes('uol.com.br'));

console.log('\nTela inicial e saída explícita');
const roomCards = read('components/chat/RoomCards.tsx');

check('Tela inicial: cards de salas (RoomCards) antes de entrar', page.includes('RoomCards'));
check('Tela inicial: não auto-seleciona a primeira sala', !page.includes('rooms[0].id'));
check(
  'Tela inicial: cards com nome, tópico e online/capacity',
  roomCards.includes('room.name') && roomCards.includes('room.topic') &&
    roomCards.includes('room.online}/{room.capacity}'),
);
check(
  'Tela inicial: seleção de card acessível (aria-label + active:scale-95)',
  roomCards.includes('aria-label={`entrar na sala ${room.name}`}') && roomCards.includes('active:scale-95'),
);
check('Saída: chama o endpoint /leave', page.includes('/leave'));
check('Saída: botão explícito "sair da sala"', page.includes('sair da sala'));
check('Saída: erro da saída com role="alert" + tentar novamente', page.includes('leaveError') && page.includes('tentar novamente'));
check('Saída: navegar ao portal sai da sala antes (handleBack + preventDefault)', page.includes('handleBack') && page.includes('preventDefault'));
check('Saída: reentrada por TTL só com sala ativa (guarda roomId)', page.includes('nick === null || roomId === null'));
check('Saída: troca de sala sai da anterior antes de entrar na nova', page.includes('handleSwitchRoom') && page.includes('await leave('));
check('Saída: troca limpa presença residual na sala de destino (leave idempotente)', page.includes('await leave(nextRoomId'));
check('Entrada: idempotente no cliente (leave antes do enter evita 400 do próprio nick)', page.includes('await leave(target, newNick)'));
check('Troca: feed de sala anterior descartado por roomId (evita reentrada falsa)', page.includes('feedSnapshot.roomId === roomId'));

console.log(`\nResultado: ${failed === 0 ? 'PASS' : `${failed} FAIL`}`);
if (failed > 0) {
  console.log('\nAcessibilidade do /bate-papo reprovada.');
  process.exit(1);
}
console.log('Acessibilidade AA do /bate-papo aprovada.\n');
