## 1. Contrato e tipos (Track A — gate para as demais tracks)

- [x] 1.1 [PARALLEL TRACK-A] Estender `Short` em `shared/` (`mediaUrl`, `mediaType`, `articleUrl`, `poll?`) e adicionar `Poll`/`PollOption` (`question`, `options[{id,label,votes}]`, `totalVotes`).
- [x] 1.2 [PARALLEL TRACK-A] Congelar contrato: `openspec validate uol-flash-short --strict` passa sem avisos; nenhuma alteração de contrato após este ponto.

## 2. Backend (Track B — `backend/`, :3001)

- [x] 2.1 [PARALLEL TRACK-B] Seed em memória de 6 shorts do universo UOL: mídia picsum vertical `720/1280`, `articleUrl`, `durationMs`, enquete embutida, cobrindo as 5 editorias canônicas.
- [x] 2.2 [PARALLEL TRACK-B] `GET /api/flash/shorts?sort=recent|popular&limit=` com default `limit=20`, `sort=recent` por `createdAt` desc e `sort=popular` por `reactions` desc.
- [x] 2.3 [PARALLEL TRACK-B] `GET /api/flash/shorts/:id` com `404` (`NOT_FOUND`) para id inexistente.
- [x] 2.4 [PARALLEL TRACK-B] `POST /api/flash/shorts` com validação completa (`400` `BAD_REQUEST`: title 1–120, body 1–500, editoria canônica, mediaUrl http(s), mediaType enum, articleUrl opcional, poll opcional 2–4 opções) e `201` com o short criado (`reactions: 0`, `durationMs` derivado).
- [x] 2.5 [PARALLEL TRACK-B] `POST /api/flash/shorts/:id/reactions` incrementando e respondendo `Reaction` (`shortId`, `count`, `updatedAt`); `404` para short inexistente.
- [x] 2.6 [PARALLEL TRACK-B] `POST /api/flash/shorts/:id/vote` com body `{ optionId }`: `200` com `poll` atualizado; `400` para opção inválida/ausente ou short sem enquete; `404` para short inexistente.
- [x] 2.7 [PARALLEL TRACK-B] Registrar rotas em `app.ts` reusando envelope/erros/telemetria da fundação; smoke manual conferindo `latencyMs`/`traceId` em sucesso e erro.

## 3. Frontend (Track C — `frontend/src/`, :3000)

- [x] 3.1 [PARALLEL TRACK-C] Rota imersiva `/flash` fora do `Layout` do portal, com moldura de smartphone 9:16 centralizada e atalho discreto de retorno ao portal.
- [x] 3.2 [PARALLEL TRACK-C] `ShortFeed` com `snap-y snap-mandatory` + `ShortCard` (`key={short.id}` estável): mídia vertical com `onError` → fallback na cor da editoria, chip de editoria no token, badge `durationMs` em JetBrains Mono, título + resumo com scrim para contraste AA.
- [x] 3.3 [PARALLEL TRACK-C] Rail de ações flutuante: Curtir (`POST /reactions` + dedup `localStorage` + contador), Compartilhar (`navigator.share` → fallback clipboard + toast `role="status"`), Publicar (abre modal).
- [x] 3.4 [PARALLEL TRACK-C] Bottom sheet "Ler Matéria Completa" (condicional a `articleUrl`): `role="dialog"`, focus trap, `Esc`, retorno de foco, ação externa com `rel="noopener noreferrer"`.
- [x] 3.5 [PARALLEL TRACK-C] `PollCard` sobre a mídia: voto via `POST /vote`, percentuais com barras na cor da editoria, dedup 1 voto por short por browser, resultado em `aria-live="polite"`.
- [x] 3.6 [PARALLEL TRACK-C] Toggle **Recentes / Mais curtidos** (`sort=recent|popular`); reordenação apenas por ação explícita no toggle.
- [x] 3.7 [PARALLEL TRACK-C] Modal de publicação: campos do contrato, validação client-side espelhando o `400`, erro do servidor exibido, sucesso → toast + short no topo do feed.
- [x] 3.8 [PARALLEL TRACK-C] Polling de 3s reusando `usePolling` (cleanup + pausa em `document.hidden`): contadores atualizam in-place sem remontar cards nem perder snap; `aria-live="polite"` apenas nos contadores do card visível.
- [x] 3.9 [PARALLEL TRACK-C] Navegação por teclado (setas ↑/↓ com snap, `prefers-reduced-motion`) e estados `loading` (skeleton na moldura) / `erro` (`role="alert"` + tentar novamente) / `vazio` (orientação + atalho ao modal).
- [x] 3.10 [PARALLEL TRACK-C] Créditos "baseado em uol.com.br" no rodapé do `/flash`, sem emoji e sem quebra de marca (§5.6).

## 4. QA e demo (Track D — `qa/`)

- [x] 4.1 [PARALLEL TRACK-D] Cenário: feed `recent`/`popular` + polling de 3s com cleanup (sem intervalos órfãos, pausa com aba oculta).
- [x] 4.2 [PARALLEL TRACK-D] Cenário: reação `200` com `count` incrementado, `404` em short inexistente, dedup `localStorage` na UI.
- [x] 4.3 [PARALLEL TRACK-D] Cenário: voto `200` com `totalVotes` consistente, `400` opção inválida/sem enquete, `404` short inexistente, percentuais corretos na UI.
- [x] 4.4 [PARALLEL TRACK-D] Cenário: publicação `201` (short no topo do feed) e `400` com payload inválido (editoria fora das canônicas).
- [x] 4.5 [PARALLEL TRACK-D] Cenário: `404` no detalhe + envelope `{ data, meta }` com `latencyMs`/`contract`/`traceId` em todos os endpoints, inclusive erro.
- [x] 4.6 [PARALLEL TRACK-D] Cenário: a11y — teclado no feed, focus trap no sheet/modal, `aria-live` nos contadores, contraste AA em dark e light (incluindo amarelo com texto preto).
- [x] 4.7 [PARALLEL TRACK-D] Evidências (capturas/outputs) + roteiro de demo ponta-a-ponta: scroll snap → curtir → votar → publicar → toggle Mais curtidos.
