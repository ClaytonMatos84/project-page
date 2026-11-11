# Cenário 4.9 — Evidências e roteiro de demo ponta-a-ponta

**Spec:** `chat-frontend-core` (integração) · AGENTS.md §8 Fase 4/5 (demo).
**Track:** D. **Pré-condição:** API em `:3001` (`npm run dev:backend`); frontend em `:3000` (`npm run dev:frontend`).

## Roteiro de demo (5 min)

1. **Chegada** — abrir `http://localhost:3000/` e clicar em **"Bate-Papo"** no Header (ao lado de
   "Flash"): a rota imersiva abre na **tela inicial de cards** das 4 salas — nenhuma entra sozinha.
2. **Selecionar e entrar** — clicar no card da Arquibancada Esporte: o modal de apelido abre; digitar
   `visitante_2026` e entrar. As 3 colunas aparecem, o nick entra na lista de participantes, o
   contador de online sobe para 36 e a barra de lotação acompanha (36/40, amarela — a Splash fica
   vermelha acima de 80%).
3. **Trocar de sala** — clicar em "Paquera SP" na coluna esquerda: a UI sai da sala anterior
   (`/leave`) e re-entra na nova; o feed e o banner ao vivo mudam de tópico.
4. **Gritar** — no composer, escolher "grita com" + Todos e enviar: a mensagem entra no feed em
   caixa alta e vermelho UOL, sem recarregar (polling de 3s).
5. **Sussurrar reservado** — clicar em um nick na coluna de participantes (destinatário automático),
   marcar "Reservadamente", escolher "sussurra para" e enviar: a mensagem aparece com fundo amarelo,
   texto preto e badge "reservada" — e **só** o par a vê (filtro no servidor).
6. **Reagir** — clicar em `😂` em uma mensagem: o contador incrementa in-place e o botão desabilita
   (dedup por browser via `localStorage`).
7. **Sair da sala** — clicar em "sair da sala": a UI chama `/leave`, a presença some na hora e
   volta à tela inicial; selecionar a mesma sala de novo exige confirmar o apelido (pré-preenchido),
   sem erro de apelido em uso.
8. **Voltar ao portal** — já dentro de uma sala, clicar em "← voltar ao portal": sai da sala
   (`/leave`) e navega para a home do Mini Portal UOL.
9. **Contrato** — rodar `npm run qa:chat` e `npm run qa:chat:a11y` com a API no ar: ambos verdes.

## Evidências

| Evidência | Arquivo |
| --------- | ------- |
| Smoke de contrato 4.1–4.6 (output completo, inclui TTL) | [`qa/evidence/chat/smoke-output.txt`](../evidence/chat/smoke-output.txt) |
| A11y AA 4.7/4.8 (contraste + estáticos) | [`qa/evidence/chat/a11y-output.txt`](../evidence/chat/a11y-output.txt) |
| Captura do `/bate-papo` renderizado (headless Chrome, light) | [`qa/evidence/chat/chat-screenshot.png`](../evidence/chat/chat-screenshot.png) |
| Captura do `/bate-papo` em dark | [`qa/evidence/chat/chat-screenshot-dark.png`](../evidence/chat/chat-screenshot-dark.png) |
| Captura do DOM renderizado com dados da API | [`qa/evidence/chat/chat-dom.html`](../evidence/chat/chat-dom.html) |

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Roteiro executa ponta-a-ponta | entrar → trocar de sala → gritar → sussurrar reservado → reagir → voltar ao portal, sem erro |
| 2 | Scripts de QA | `chat-smoke.mjs` e `chat-a11y.mjs` saem 0 |
| 3 | Evidências publicadas | outputs e capturas em `qa/evidence/chat/` |
