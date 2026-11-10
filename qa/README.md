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
```

Ambos os scripts saem com código `≠ 0` quando um cenário falha, imprimindo a evidência.
