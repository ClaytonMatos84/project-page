## Context

Sprint UOL com fundação congelada (`uol-foundation`: envelope `{ data, meta }` com telemetria,
erros 400/404/500 padronizados, tokens de design) e dois produtos entregues (`mini-portal-uol`,
`uol-flash-short`). A camada de dados do frontend (`apiFetch<T>`, `ApiError`, `usePolling` com
cleanup e pausa por `document.hidden`) existe e é reusável. As entidades `Room`/`Message`/`Presence`
em `shared/` são skeletons (nenhum endpoint as consumia) — esta change é a spec Track A que as
define por completo. Produto: §3.3 do AGENTS.md (salas em tempo quase real, presença, moderação
leve), em homenagem ao Bate-Papo UOL clássico. Decisões abaixo fechadas em exploração com o usuário.

## Goals / Non-Goals

**Goals:**
- Contrato REST imutável do bate-papo: salas com lotação, entrada com apelido, feed com reservadas
  filtradas no servidor, envio com ação/destinatário/reservadamente, reações.
- Presença crível sem auth: `enter` + TTL refrescado pelo polling (`?nick=`), apelido único por sala.
- Tela inicial com cards informativos das salas e seleção explícita; UI nostálgica em 3 colunas após
  entrar: barra de lotação clássica, composer Ação + Destinatário + "Reservadamente", renderização
  por ação (grito/sussurra/reservada), participantes clicáveis.
- Saída explícita remove presença imediatamente; voltar ao bate-papo exige selecionar sala e entrar
  novamente, ainda que o apelido seja pré-preenchido.
- Navegação bidirecional: "Bate-Papo" no Header do portal; "voltar ao portal" no chat.
- Reuso máximo da fundação: envelope, erros, telemetria, tokens, `apiFetch`, `usePolling`.

**Non-Goals:**
- Autenticação/identidade real (`?nick=` é afirmação do cliente; demo sem segredos).
- WebSocket/SSE (atualização é polling de 3s, §4.2).
- Bloqueio de sala cheia (lotação é visual; o seed nunca enche — ver Decisão 8).
- `since`/merge incremental no cliente (replace completo das últimas N — ver Decisão 11).
- Persistência além de memória (§2.1 — seed repovoado no boot).

## Decisions

1. **Rotas sob `/api/chat/`** — precedência §1: AGENTS.md §3.2/§3.3 (`/api/portal/*`, `/api/flash/*`,
   `/api/chat/*`) vence o sketch original (`/api/rooms`, `/api/messages/:id/react`). Reação fica em
   `POST /api/chat/messages/:id/react` (namespaced). Alternativa descartada: seguir o sketch
   (quebra o padrão de namespace da casa).
2. **Presença = `enter` + TTL 10s com sinal via polling** — `POST /enter { nick }` registra
   `lastSeenAt`; `GET /messages?nick=` refresca o TTL a cada poll de 3s; varredura **preguiçosa**
   no read path remove apelitos com `lastSeenAt` > 10s (sem `setInterval` no backend). O `GET` com
   efeito colateral é aceito e documentado. Alternativas descartadas: seed estático (o usuário não
   aparece na lista — mata a tela `Entrada` do §3.3) e `POST /heartbeat` dedicado (4ª chamada por
   ciclo, ruído sem ganho).
3. **Apelido único por sala (`400` se em uso)** — nostálgico ("este apelido já está em uso");
   regex `^[\w-]{2,24}$`. Troca de nick na mesma sala continua usando `enter`; ao sair da sala ou
   trocar de sala, a UI chama `POST /leave` para remover a presença imediatamente. O endpoint é
   idempotente para repetição segura. Alternativa descartada: aceitar duplicados (dois "gata_sp_98"
   quebram a semântica de "clique no nick = destinatário").
4. **Reservadas filtradas no servidor** — `GET /messages?nick=X` devolve públicas + reservadas em
   que X é autor ou destinatário; reservadas de terceiros não saem da API. Regra de brinde:
   `isPrivate: true` com `recipient: 'Todos'` → `400` (contradição). Alternativa descartada:
   devolver tudo e filtrar no cliente (vaza conversa "reservada" para qualquer cliente).
5. **`author`, não `sender`** — consistência com `Message` do `shared/` e §3.3 do AGENTS.md.
   O par semântico fica `author`/`recipient`. Alternativa descartada: renomear para `sender`
   (fricção com contrato existente por gosto).
6. **Ações canônicas com renderização própria** — enum `['fala para', 'grita com', 'sussurra para',
   'concorda com']`. Renderização (UI & Aesthetic Contract): `fala para` = nick em bold; `grita com`
   = texto em **caixa alta + vermelho UOL**; `sussurra para` = itálico muted; `concorda com` =
   azul `#005FFF`; reservada = fundo `--uol-yellow` com texto **preto** (§5.1) + badge. O servidor
   **não** transforma o texto (grito não vira caixa alta no `data` — é apresentação).
7. **Reações: set fixo `👍`/`😂`/`❤️`, `reactions: Record<string, number>`** — emojis são **funcionais**
   (conteúdo da reação), não decorativos — anti-slop (§5.6) ok. `POST /react { emoji }` incrementa;
   dedup por browser via `localStorage` (precedente do flash, decisão lá registrada).
   Alternativa descartada: contador único "curtir" (perde a graça das reações do sketch).
8. **Lotação visual-only** — `Room` ganha `capacity` (40) e `color` (acento de editoria §5.2);
   `online = participants.length` (seed é a fonte da verdade). Barra clássica: preenchimento
   amarelo, **vermelho acima de 80%**. Sem `400 ROOM_FULL`: o seed nunca enche, regra sem payoff
   (usuário decidiu visual-only na exploração). Alternativa descartada: bloquear entrada.
9. **Participantes piggyback no `GET /messages`** — `data = { messages, participants }`: um poll
   de 3s dirige o feed (centro) e a lista de nicks (direita). Alternativa descartada:
   `GET /rooms/:id/participants` separado (segunda chamada por ciclo, N+1 de presença).
10. **`GET /api/chat/rooms/:id` (detalhe) omitido** — a UI deriva tudo de `GET /rooms` (lista) +
    `GET /messages` (sala corrente). Alternativa descartada: endpoint sem consumidor na UI.
11. **Replace completo das últimas N** — `limit` default 50 (teto 200), ordenação `createdAt`
    ascendente (estilo chat). `since=<iso>` do §3.3 fica A CRITÉRIO não implementado: histórico
    pequeno torna merge no cliente complexidade sem ganho.
12. **`POST /messages` responde `201`** com a mensagem criada; validação falha → `400`
    (`BAD_REQUEST`). Regras: `author` 2–24 (regex do nick), `action` ∈ enum, `recipient` =
    `'Todos'` ou nick presente na sala, `text` 1–500 (após trim), `isPrivate` booleano;
    `isPrivate && recipient === 'Todos'` → `400`; sala inexistente → `404`.
13. **Rota `/bate-papo` fora do `Layout`** — experiência imersiva em 3 colunas, precedente
    `/flash` (App.tsx); barra própria com "voltar ao portal" + `ThemeToggle`; link "Bate-Papo"
    no `Header` do portal ao lado de "Flash". Slug pt-BR segue a casa (`/editoria`, `/busca`).
14. **Entrada = seleção de sala, depois modal de apelido** — `/bate-papo` inicia com cards
     informativos e não escolhe sala automaticamente; após selecionar, o modal `Entrada` do §3.3
     exige confirmação do nick. `localStorage` pode pré-preencher o campo, mas não cria presença.
     Saída volta à tela inicial e exige nova entrada; troca rápida fica na coluna esquerda
     (re-enter). Mobile: colunas **colapsam** — feed prioritário, salas/participantes em seções
     colapsáveis.

15. **A11y do chat** — feed com `role="log"` (região live polite implícita, sem reler o histórico
    todo a cada poll: as mensagens novas entram no fim); `aria-live="polite"` no contador de
    online; foco visível no composer; `active:scale-95` em botões; `animate-ping` no indicador
    "ao vivo" do banner (§5.5); contraste AA em dark e light (amarelo sempre com texto preto).

## Risks / Trade-offs

- [`?nick=` é afirmação do cliente — spoofável] → aceito para demo sem auth; sem segredo em jogo;
  documentado aqui e no relatório (§9).
- [Aba oculta pausa o polling (§4.2) → TTL expira e o nick sai da sala] → mitigado no frontend:
  ao retomar o foco durante uma sala ativa, se o nick sumiu de `participants`, ocorre
  **re-entrada automática**; após saída explícita, nenhuma re-entrada automática acontece.
- [Restart da API perde presença/mensagens] → by design (§2.1); seed repovoado no boot.
- [GET com efeito colateral (refresco de TTL)] → aceito e documentado (Decisão 2); alternativa
  limpa (heartbeat) custa uma chamada extra por ciclo de poll.
- [Dois pollers de 3s (salas + mensagens)] → ambos com cleanup via `usePolling`; custo aceitável
  para demo local.
- [Seed da Arquibancada com 35/40 nicks] → conteúdo de seed verboso, mas é a alma nostálgica
  (barra vermelha de sala quase cheia); Track B escreve uma vez.

## Migration Plan

Aditivo e reversível: nova rota `routes/chat.ts` no Express e nova rota `/bate-papo` no React;
link novo no `Header` do portal. Nada do portal/flash é tocado; `shared/` só ganha campos e
redefine um skeleton não consumido (não-quebra). Rollback = remover as rotas novas e o link.

## Open Questions

Nenhuma bloqueante. Decisões menores fechadas como A CRITÉRIO: `limit` teto 200 (Decisão 11),
cor de `Splash Reality` = vermelho geral `#CB0003` (Paquera fica com o laranja de entretenimento).
