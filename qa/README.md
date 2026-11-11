# QA / Demo — Track D (foundation)

Cenários derivados do **contrato** (`openspec/changes/uol-foundation/specs/`), não do código.
Dono: `@qa-demo`. Independente de quem escreveu o código (§7).

## Cenários

| ID | Cenário | Arquivo | Spec |
| -- | ------- | ------- | ---- |
| 4.1 | Envelope `{ data, meta }` + `latencyMs` em sucesso e erro | [`scenarios/envelope.md`](./scenarios/envelope.md) | `api-convention` |
| 4.2 | Contraste AA em dark/light, incluindo `#FFCE00` ↔ texto preto | [`scenarios/contrast.md`](./scenarios/contrast.md) | `design-tokens` |
| 4.3 | `/health` respondendo e `404` no formato padrão | [`scenarios/health-404.md`](./scenarios/health-404.md) | `api-convention` |

### Mini Portal UOL (`mini-portal-uol`)

| ID | Cenário | Arquivo | Spec |
| -- | ------- | ------- | ---- |
| 4.1 | `GET /api/portal/highlights` + polling de 3s com cleanup | [`scenarios/portal-highlights-polling.md`](./scenarios/portal-highlights-polling.md) | `portal-highlights` / `portal-frontend-core` |
| 4.2 | Listagem por editoria + estados `loading`/`erro`/`vazio` | [`scenarios/portal-editoria-list.md`](./scenarios/portal-editoria-list.md) | `portal-editorias` / `portal-articles` |
| 4.3 | Detalhe `404` no formato padrão | [`scenarios/portal-article-404.md`](./scenarios/portal-article-404.md) | `portal-articles` |
| 4.4 | Busca com resultado, vazio e `400` sem termo | [`scenarios/portal-search.md`](./scenarios/portal-search.md) | `portal-search` |
| 4.5 | Acessibilidade AA + `aria-live` em dark e light | [`scenarios/portal-a11y.md`](./scenarios/portal-a11y.md) | `portal-frontend-core` |

### UOL Flash Short (`uol-flash-short`)

| ID | Cenário | Arquivo | Spec |
| -- | ------- | ------- | ---- |
| 4.1 | Feed `recent`/`popular` + polling de 3s com cleanup (contadores in-place) | [`scenarios/flash-feed-polling.md`](./scenarios/flash-feed-polling.md) | `flash-shorts` / `flash-frontend-core` |
| 4.2 | Reação `200` com `count` incrementado, `404` e dedup `localStorage` na UI | [`scenarios/flash-reactions.md`](./scenarios/flash-reactions.md) | `flash-reactions` |
| 4.3 | Voto `200` com `totalVotes` consistente, `400`/`404` e percentuais na UI | [`scenarios/flash-polls.md`](./scenarios/flash-polls.md) | `flash-polls` |
| 4.4 | Publicação `201` (topo do feed) e `400` com payload inválido | [`scenarios/flash-publish.md`](./scenarios/flash-publish.md) | `flash-shorts` |
| 4.5 | `404` no detalhe + envelope `{ data, meta }` com telemetria em tudo | [`scenarios/flash-404-envelope.md`](./scenarios/flash-404-envelope.md) | `flash-shorts` / `api-convention` |
| 4.6 | A11y — teclado, focus trap, `aria-live` seletivo, contraste AA (amarelo + preto) | [`scenarios/flash-a11y.md`](./scenarios/flash-a11y.md) | `flash-frontend-core` / `design-tokens` |
| 4.7 | Evidências + roteiro de demo ponta-a-ponta | [`scenarios/flash-demo.md`](./scenarios/flash-demo.md) | `flash-frontend-core` |

### Bate-Papo UOL Next-Gen (`add-bate-papo`)

| ID | Cenário | Arquivo | Spec |
| -- | ------- | ------- | ---- |
| 4.1 | Listagem de salas com lotação ("35/40") + envelope `{ data, meta }` com telemetria em tudo, inclusive erro | [`scenarios/chat-rooms-envelope.md`](./scenarios/chat-rooms-envelope.md) | `chat-rooms` / `api-convention` |
| 4.2 | Entrada `200` (nick em `participants`, `online` incrementado), `400` apelido em uso/inválido, `404` sala | [`scenarios/chat-enter.md`](./scenarios/chat-enter.md) | `chat-presence` |
| 4.3 | Presença por TTL — nick some de `participants` após >10s sem sinal; re-entrada automática ao retomar o foco | [`scenarios/chat-presence-ttl.md`](./scenarios/chat-presence-ttl.md) | `chat-presence` / `chat-frontend-core` |
| 4.4 | Envio `201` (mensagem no feed), `400` ação inválida / reservada para `Todos` / destinatário ausente / texto fora de 1–500, `404` sala | [`scenarios/chat-messages.md`](./scenarios/chat-messages.md) | `chat-messages` |
| 4.5 | Reservadas visíveis só ao par autor/destinatário; terceiro não vê; renderização amarela + texto preto + badge | [`scenarios/chat-private-filter.md`](./scenarios/chat-private-filter.md) | `chat-messages` |
| 4.6 | Reação `200` com contador incrementado, `400` emoji fora do set, `404` mensagem, dedup `localStorage` na UI | [`scenarios/chat-reactions.md`](./scenarios/chat-reactions.md) | `chat-reactions` |
| 4.7 | Polling de 3s com cleanup (2 pollers, pausa com aba oculta) + navegação bidirecional | [`scenarios/chat-polling-nav.md`](./scenarios/chat-polling-nav.md) | `chat-frontend-core` |
| 4.8 | A11y — `role="log"` no feed, `aria-live` no contador online, teclado no composer/modal, contraste AA em dark e light | [`scenarios/chat-a11y.md`](./scenarios/chat-a11y.md) | `chat-frontend-core` / `design-tokens` |
| 4.9 | Evidências + roteiro de demo ponta-a-ponta | [`scenarios/chat-demo.md`](./scenarios/chat-demo.md) | `chat-frontend-core` |
| 5.2 | Tela inicial com cards, entrada só após seleção e saída explícita (`/leave`) | [`scenarios/chat-leave.md`](./scenarios/chat-leave.md) | `chat-frontend-core` / `chat-presence` |

## Execução automatizada

```bash
# Sobe a API primeiro:
npm run dev:backend

# foundation — 4.1 + 4.3 (contrato HTTP) e 4.2 (contraste):
node qa/scripts/smoke.mjs            # BASE_URL=http://localhost:3001
node qa/scripts/contrast.mjs

# mini-portal-uol — contrato HTTP (4.1..4.4) e a11y (4.5):
node qa/scripts/portal-smoke.mjs     # BASE_URL=http://localhost:3001
node qa/scripts/portal-a11y.mjs

# uol-flash-short — contrato HTTP (4.1..4.5) e a11y (4.6):
node qa/scripts/flash-smoke.mjs       # BASE_URL=http://localhost:3001
node qa/scripts/flash-a11y.mjs
# (ou: npm run qa:flash / npm run qa:flash:a11y)

# add-bate-papo — contrato HTTP (4.1..4.6 + 5.2 saída, inclui espera de TTL ~11s) e a11y (4.7/4.8):
node qa/scripts/chat-smoke.mjs        # BASE_URL=http://localhost:3001
node qa/scripts/chat-a11y.mjs
# (ou: npm run qa:chat / npm run qa:chat:a11y)
```

Ambos os scripts saem com código `≠ 0` quando um cenário falha, imprimindo a evidência.
