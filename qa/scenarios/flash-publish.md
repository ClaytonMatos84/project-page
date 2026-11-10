# Cenário 4.4 — Publicação: `201` no topo do feed e `400` com payload inválido

**Spec:** `flash-shorts` › "Publicação de novo short" e "Validação da publicação" · `flash-frontend-core` › "Modal de publicação de short".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. `POST /api/flash/shorts` com payload válido (`title`, `body`, `editoria` canônica, `mediaUrl` http(s), `mediaType`, `articleUrl?`, `poll?`).
2. `GET /api/flash/shorts?sort=recent` e conferir o topo.
3. `POST /api/flash/shorts` com `editoria` fora das 5 canônicas; com `title` > 120; com `mediaUrl` não http(s); com `poll` de 1 opção.
4. Na UI, publicar pelo modal e conferir toast + topo do feed.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Payload válido | `201` com o short criado no `data` do envelope |
| 2 | Short criado | `reactions: 0`, `createdAt` agora, `durationMs` derivado do `body` pelo servidor |
| 3 | Poll normalizado | servidor atribui `opt-<n>` e `votes: 0`/`totalVotes: 0` |
| 4 | Feed `recent` | short novo aparece no topo |
| 5 | Editoria inválida | `400` `BAD_REQUEST` ("editoria must be one of the canonical slugs") e feed inalterado |
| 6 | Outras validações | `400` para title > 120, mediaUrl não http(s), poll com < 2 opções |
| 7 | Telemetria | `latencyMs`/`traceId`/`contract` em `201` e `400` |
| 8 | UI | modal valida client-side espelhando o `400`; erro do servidor exibido (`role="alert"`); sucesso → fecha modal + toast `role="status"` + short no topo do feed Recentes |

## Evidência esperada

`node qa/scripts/flash-smoke.mjs` valida 1–7 (contrato). O critério 8 é verificado estaticamente por `node qa/scripts/flash-a11y.mjs` (validação espelhada, `role="alert"`, `role="status"` no toast).
