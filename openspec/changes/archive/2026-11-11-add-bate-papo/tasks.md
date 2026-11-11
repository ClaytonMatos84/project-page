## 1. Contrato e tipos (Track A — gate para as demais tracks)

- [x] 1.1 [PARALLEL TRACK-A] Estender entidades em `shared/`: `Room` (+`capacity`, `+color`), `Message` (+`action`, `recipient`, `isPrivate`, `reactions`), `Presence` por apelido (`nick`, `lastSeenAt`); adicionar tipos `ChatAction` (enum canônico), `ReactionEmoji` (`👍`/`😂`/`❤️`), `EnterResult` e `RoomFeed` (`{ messages, participants }`).
- [x] 1.2 [PARALLEL TRACK-A] Congelar contrato: `openspec validate add-bate-papo --strict` passa sem avisos; nenhuma alteração de contrato após este ponto.

## 2. Backend (Track B — `backend/`, :3001)

- [x] 2.1 [PARALLEL TRACK-B] Seed em memória de 4 salas temáticas (Arquibancada Esporte 35/40 azul, Devs & OpenCode 12/40 roxo, Paquera SP 27/40 laranja, Splash Reality 18/40 vermelho) com tópico ao vivo, nicks de época por sala, histórico inicial exercitando as 4 ações + mensagens reservadas de terceiros (para o filtro) + reações pré-contadas.
- [x] 2.2 [PARALLEL TRACK-B] `GET /api/chat/rooms` com `online = participants.length`, `capacity` e `color` por sala.
- [x] 2.3 [PARALLEL TRACK-B] `POST /api/chat/rooms/:id/enter` com body `{ nick }`: `200` com `roomId`/`nick`/`online`/`participants`; `400` apelido fora de `^[\w-]{2,24}$` ou em uso na sala; `404` sala inexistente.
- [x] 2.4 [PARALLEL TRACK-B] `GET /api/chat/rooms/:id/messages?nick=&limit=`: `{ messages, participants }` com `limit` default 50 (teto 200), ordem `createdAt` asc, **reservadas filtradas** (só par autor/destinatário), refresco de TTL de presença e varredura preguiçosa de apelidos com `lastSeenAt` > 10s; `404` sala inexistente.
- [x] 2.5 [PARALLEL TRACK-B] `POST /api/chat/rooms/:id/messages` com validação completa (`400`: `action` fora do enum, `text` 1–500, `author` regex do nick, `recipient` ≠ `Todos` e ausente da sala, `isPrivate` + `Todos`) e `201` com a mensagem criada (`id`/`reactions` zerado/`createdAt` pelo servidor); `404` sala inexistente.
- [x] 2.6 [PARALLEL TRACK-B] `POST /api/chat/messages/:id/react` com body `{ emoji }`: `200` com a mensagem e `reactions` incrementado; `400` emoji fora do set; `404` mensagem inexistente.
- [x] 2.7 [PARALLEL TRACK-B] Registrar `routes/chat.ts` em `app.ts` reusando envelope/erros/telemetria da fundação; smoke manual conferindo `latencyMs`/`traceId` em sucesso e erro.

## 3. Frontend (Track C — `frontend/src/`, :3000)

- [x] 3.1 [PARALLEL TRACK-C] Rota imersiva `/bate-papo` fora do `Layout` (precedente `/flash`), com barra própria "← voltar ao portal" + `ThemeToggle`; link "Bate-Papo" no `Header` do portal ao lado de "Flash".
- [x] 3.2 [PARALLEL TRACK-C] Modal de entrada (`Entrada`): campo de apelido com validação client-side espelhando o `400`, erro de apelido em uso com `role="alert"`, `role="dialog"` + focus trap + `Esc`, nick persistido em `localStorage`.
- [x] 3.3 [PARALLEL TRACK-C] Coluna esquerda: lista de salas com barra de lotação clássica (amarelo, vermelho > 80%, contagem "35/40" em JetBrains Mono), sala ativa destacada na `color`, troca rápida de nick (re-enter).
- [x] 3.4 [PARALLEL TRACK-C] Coluna central: banner de evento ao vivo com `topic` + `animate-ping`; feed `role="log"` com renderização por ação (fala = nick bold, grita = caixa alta + vermelho, sussurra = itálico muted, concorda = azul, reservada = fundo amarelo + texto preto + badge), timestamps em JetBrains Mono.
- [x] 3.5 [PARALLEL TRACK-C] Composer clássico: seletor de Ação + seletor de Destinatário (`Todos` + participantes) + checkbox "Reservadamente" + envio via POST; `isPrivate` + `Todos` bloqueado client-side com mensagem inline; Enter envia.
- [x] 3.6 [PARALLEL TRACK-C] Coluna direita: participantes online com clique = destinatário automático, `aria-label` "conversar com {nick}", nick próprio destacado, `aria-live="polite"` no contador de online.
- [x] 3.7 [PARALLEL TRACK-C] Reações `👍`/`😂`/`❤️` por mensagem: POST com dedup `localStorage` (1 por emoji por mensagem), contadores in-place com `key={message.id}` estável.
- [x] 3.8 [PARALLEL TRACK-C] 2 pollers de 3s reusando `usePolling` (salas; mensagens + participantes com `?nick=`); re-entrada automática ao retomar o foco quando o nick expirou por TTL; estados `loading` (skeleton) / `erro` (`role="alert"` + tentar novamente) / `vazio` (orientação) por região.
- [x] 3.9 [PARALLEL TRACK-C] Mobile: colunas colapsam com feed prioritário, salas/participantes em seções colapsáveis; contraste AA em dark e light (amarelo sempre com texto preto).
- [x] 3.10 [PARALLEL TRACK-C] Créditos "baseado em uol.com.br" no rodapé do `/bate-papo`, sem emoji e sem quebra de marca (§5.6).

## 4. QA e demo (Track D — `qa/`)

- [x] 4.1 [PARALLEL TRACK-D] Cenário: listagem de salas com lotação correta ("35/40") + envelope `{ data, meta }` com `latencyMs`/`contract`/`traceId` em todos os endpoints, inclusive erro.
- [x] 4.2 [PARALLEL TRACK-D] Cenário: entrada `200` (nick em `participants`, `online` incrementado), `400` apelido em uso/inválido, `404` sala inexistente.
- [x] 4.3 [PARALLEL TRACK-D] Cenário: presença por TTL — nick some de `participants` após >10s sem sinal; re-entrada automática ao retomar o foco na UI.
- [x] 4.4 [PARALLEL TRACK-D] Cenário: envio `201` (mensagem aparece no feed), `400` ação inválida / reservada para `Todos` / destinatário ausente, `404` sala inexistente.
- [x] 4.5 [PARALLEL TRACK-D] Cenário: reservadas visíveis só ao par — `?nick=` do autor/destinatário as vê; terceiro não; renderização com fundo amarelo + texto preto + badge.
- [x] 4.6 [PARALLEL TRACK-D] Cenário: reação `200` com contador incrementado, `400` emoji fora do set, `404` mensagem inexistente, dedup `localStorage` na UI.
- [x] 4.7 [PARALLEL TRACK-D] Cenário: polling de 3s com cleanup (2 pollers, sem intervalos órfãos, pausa com aba oculta) + navegação bidirecional (Header → `/bate-papo` → voltar ao portal).
- [x] 4.8 [PARALLEL TRACK-D] Cenário: a11y — `role="log"` no feed, `aria-live` no contador online, teclado no composer/modal, contraste AA em dark e light (incluindo amarelo com texto preto).
- [x] 4.9 [PARALLEL TRACK-D] Evidências (capturas/outputs) + roteiro de demo ponta-a-ponta: entrar com apelido → trocar de sala → gritar → sussurrar reservado → reagir → voltar ao portal.

## 5. Tela inicial e saída explícita (revisão da change)

- [x] 5.1 [PARALLEL TRACK-A] Atualizar e revalidar o contrato OpenSpec para a tela inicial, os cards e o endpoint de saída; obter nova aprovação do contrato antes das tracks B/C/D.
- [x] 5.2 [PARALLEL TRACK-B] Implementar `POST /api/chat/rooms/:id/leave` com `{ nick }`, removendo a presença imediatamente e retornando participantes/online atualizados; operação idempotente e erros conforme envelope.
- [x] 5.3 [PARALLEL TRACK-C] Fazer `/bate-papo` abrir em tela inicial com cards alimentados por `GET /api/chat/rooms`; apresentar dados disponíveis (nome, tópico, online/capacity) e só abrir o modal de apelido após selecionar uma sala.
- [x] 5.4 [PARALLEL TRACK-C] Adicionar saída explícita da sala; chamar `/leave` antes de voltar à tela inicial, trocar de sala ou navegar ao portal; reter nickname apenas para pré-preenchimento e exigir confirmação para nova entrada.
- [x] 5.5 [PARALLEL TRACK-C] Garantir que o fluxo de polling/reentrada por TTL se aplique somente à sessão de sala ativa e não reentre após saída explícita.
- [x] 5.6 [PARALLEL TRACK-D] Cobrir cards e entrada somente após seleção; saída remove nick e reduz `online`; retorno com o mesmo nickname exige nova confirmação e não recebe erro de apelido em uso.
