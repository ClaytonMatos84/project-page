# Cenário 4.7 — Evidências e roteiro de demo ponta-a-ponta

**Spec:** `flash-frontend-core` (integração) · AGENTS.md §8 Fase 4/5 (demo).
**Track:** D. **Pré-condição:** API em `:3001` (`npm run dev:backend`); frontend em `:3000` (`npm run dev:frontend`).

## Roteiro de demo (5 min)

1. **Scroll snap** — abrir `http://localhost:3000/flash`: moldura de smartphone com o feed
   vertical; rolar (mouse ou setas ↑/↓) entre os shorts com snap; apontar o chip de editoria,
   o badge de tempo de leitura (JetBrains Mono) e o scrim de contraste.
2. **Curtir** — clicar no coração do card visível: contador incrementa e o botão desabilita
   (dedup por browser via `localStorage`); o polling de 3s mantém o número vivo.
3. **Votar** — clicar em uma opção da enquete sobre a mídia: barras de percentual na cor da
   editoria aparecem e a votação trava neste browser; resultado em `aria-live="polite"`.
4. **Ler matéria** — clicar no ícone de artigo: bottom sheet com foco preso, `Esc` fecha,
   "Abrir matéria original" abre com `rel="noopener noreferrer"`.
5. **Publicar** — clicar no botão amarelo (texto preto): modal com campos do contrato;
   preencher e publicar → toast `role="status"` e o short novo no topo do feed Recentes.
6. **Toggle Mais curtidos** — alternar para "Mais curtidos": feed reordena por `reactions`
   desc **apenas** pela ação explícita; o polling não reordena sozinho.
7. **Contrato** — rodar `npm run qa:flash` e `npm run qa:flash:a11y` com a API no ar:
   ambos verdes (evidências em `qa/evidence/flash/`).

## Evidências

| Evidência | Arquivo |
| --------- | ------- |
| Smoke de contrato 4.1–4.5 (output completo) | [`qa/evidence/flash/smoke-output.txt`](../evidence/flash/smoke-output.txt) |
| A11y AA 4.6 (contraste + estáticos) | [`qa/evidence/flash/a11y-output.txt`](../evidence/flash/a11y-output.txt) |
| Captura do `/flash` renderizado (headless Chrome) | [`qa/evidence/flash/flash-screenshot.png`](../evidence/flash/flash-screenshot.png) |
| Captura do DOM renderizado com dados da API | [`qa/evidence/flash/flash-dom.html`](../evidence/flash/flash-dom.html) |

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Roteiro executa ponta-a-ponta | scroll snap → curtir → votar → publicar → toggle, sem erro |
| 2 | Scripts de QA | `flash-smoke.mjs` e `flash-a11y.mjs` saem 0 |
| 3 | Evidências publicadas | outputs e capturas em `qa/evidence/flash/` |
