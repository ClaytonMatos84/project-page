## Why

O **Bate-Papo UOL Next-Gen** (§3.3) é o terceiro e último produto da sprint: salas de conversa em
tempo quase real com presença — uma homenagem ao Bate-Papo UOL clássico (ações "fala para / grita
com / sussurra para / concorda com", mensagens reservadas, barra de lotação, lista de nicks).
Esta change entrega o produto que falta no ecossistema. Ela **depende** de `uol-foundation`
(gate §8 Fase 1): envelope, erros, tokens e tipografia vêm de lá; não são re-especificados aqui.

## What Changes

- API REST do bate-papo em `:3001`, persistência em memória com seed derivado dos protótipos
  (4 salas temáticas — Arquibancada Esporte, Devs & OpenCode, Paquera SP, Splash Reality — com
  tópico ao vivo, lotação, nicks de época e histórico inicial exercitando as 4 ações,
  mensagens reservadas e reações):
  - `GET /api/chat/rooms` — lista salas com `online`/`capacity` (lotação "35/40") e `topic`.
  - `POST /api/chat/rooms/:id/enter` — entrada com apelido (`400` apelido inválido/em uso, `404` sala).
  - `POST /api/chat/rooms/:id/leave` — saída explícita e imediata da sala, removendo o apelido da presença.
  - `GET /api/chat/rooms/:id/messages?nick=&limit=` — mensagens + participantes piggyback;
    **reservadas filtradas no servidor** (só o par autor/destinatário as vê); `?nick=` refresca o TTL de presença.
  - `POST /api/chat/rooms/:id/messages` — envio com `author`, `action`
    (`fala para`|`grita com`|`sussurra para`|`concorda com`), `recipient` (`Todos` ou nick),
    `text`, `isPrivate` (`400` validação, `404` sala, `201` em sucesso).
  - `POST /api/chat/messages/:id/react` — incrementa reação `👍`/`😂`/`❤️` na mensagem (`400`/`404`).
- **Presença com TTL (~10s)**: `enter` registra `nick` com `lastSeenAt`; o polling de mensagens com
  `?nick=` é o sinal de vida; varredura preguiçosa remove apelidos silenciosos. Sem WebSocket/SSE (§4.2).
- **Extensão das entidades** (contrato Track A; nenhum endpoint as consumia ainda — skeleton):
  `Room` ganha `capacity` e `color`; `Message` ganha `action`, `recipient`, `isPrivate` e `reactions`;
  `Presence` vira por apelido (`nick`, `lastSeenAt`).
- Frontend React em `:3000`: rota imersiva `/bate-papo` (fora do `Layout` do portal, precedente
  `/flash`) com uma tela inicial de cards das salas (nome, tópico e dados disponíveis, como
  quantidade de usuários e lotação); selecionar uma sala abre a entrada com apelido, sem entrar
  automaticamente na primeira sala. Após entrar, exibe **3 colunas** — salas com barra de lotação
  clássica + troca rápida de nick; feed de mensagens com renderização por ação (grito em caixa alta/vermelho, sussurra em itálico,
  reservada com fundo amarelo e texto **preto** §5.1) + banner de evento ao vivo + barra clássica
  inferior (Ação + Destinatário + checkbox "Reservadamente"); participantes online à direita
  (clique seleciona o destinatário). Colunas **colapsam** no mobile.
- **Navegação bidirecional**: link "Bate-Papo" no Header do portal (ao lado de "Flash") e
  "voltar ao portal" na barra do bate-papo; sair da sala remove a presença imediatamente e retorna
  à tela inicial, sem apagar o apelido salvo nem entrar automaticamente ao voltar.
- **Camada de dados obrigatória** (§4.2): reuso de `apiFetch<T>()` e `usePolling` (2 pollers de 3s
  com cleanup, pausa em `document.hidden`, re-entrada automática ao retomar o foco).
- Estados `loading`/`erro`/`vazio` e acessibilidade AA (§4.3): feed com `role="log"`,
  `aria-live="polite"` no contador de online, foco visível no composer.

## Capabilities

### New Capabilities
- `chat-rooms`: listagem de salas com lotação (`online`/`capacity`), tópico ao vivo e cor de editoria.
- `chat-presence`: entrada com apelido (único por sala), saída explícita que remove a presença,
  presença por TTL refrescada pelo polling, lista de participantes piggyback.
- `chat-messages`: feed da sala com **reservadas filtradas no servidor** por `?nick=` e envio com
  ação/destinatário/reservadamente com validação `400`/`404`.
- `chat-reactions`: reações `👍`/`😂`/`❤️` em mensagens (`400` emoji fora do set, `404` mensagem).
- `chat-frontend-core`: rota `/bate-papo` em 3 colunas, composer clássico, renderização por ação,
  polling 3s com cleanup, estados de UI, a11y e navegação bidirecional com o portal.

### Modified Capabilities
<!-- Nenhuma: Room/Message/Presence em shared/ são skeletons (nenhum endpoint as consumia) —
      a extensão é não-quebra, mesmo argumento da extensão de Short no flash. -->

## Impact

- **Track B (`backend/`, :3001):** nova rota `routes/chat.ts` + seed de 4 salas (nicks de época,
  histórico com as 4 ações + reservadas + reações pré-contadas); endpoint explícito `/leave` remove
  presença imediatamente; reusa envelope/erros/telemetria da fundação.
- **Track C (`frontend/src/`, :3000):** rota `/bate-papo` fora do `Layout`, tela inicial com cards
  de salas e seleção explícita, componentes de salas/feed/composer/participantes, modal de entrada
  com apelido e saída explícita; link no `Header` do portal; reusa `apiFetch`, `usePolling`,
  `tokens.css`, `ThemeToggle`.
- **`shared/`:** estende `Room` (+`capacity`, `+color`) e `Message` (+`action`, `recipient`,
  `isPrivate`, `reactions`); redefinição de `Presence` (por apelido) — somente leitura para B/C.
- **Track D (`qa/`):** cenários contra o contrato (tela inicial/cards; entrada + saída imediata +
  reentrada com o mesmo apelido; TTL + re-entrada ao focar durante sessão ativa; envio 201/400/404;
  reservadas visíveis só ao par; reações 200/400/404; polling 3s com cleanup; navegação
  bidirecional; contraste AA no amarelo com texto preto).
- Relacionamento: **depende de** `uol-foundation`.
