# Cenário 4.1 — Listagem de salas com lotação + envelope em tudo

**Spec:** `chat-rooms` › "Listagem de salas do Bate-Papo" · `api-convention` (envelope/telemetria).
**Track:** D. **Pré-condição:** API em `:3001` (`npm run dev:backend`), recém-iniciada (seed íntegro).

## Passos

1. `GET /api/chat/rooms` e conferir as 4 salas seed (Arquibancada Esporte, Devs & OpenCode, Paquera SP, Splash Reality).
2. Conferir a lotação de cada sala: `online`/`capacity` ("35/40", "12/40", "27/40", "18/40") e a `color` de editoria.
3. Conferir o envelope `{ data, meta }` com `latencyMs`/`contract`/`traceId` na resposta.
4. `GET /api/chat/rooms/nao-existe/messages` e conferir o envelope de erro (`data: null` + telemetria presente).

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Status e Content-Type | `200` com `application/json; charset=utf-8` |
| 2 | Lotação | Arquibancada 35/40 azul `#005FFF`; Devs & OpenCode 12/40 roxo `#6A1B9A`; Paquera SP 27/40 laranja `#ED5709`; Splash Reality 18/40 vermelho `#CB0003` |
| 3 | `online` ≤ `capacity` | em todas as salas; `topic` ao vivo não vazio |
| 4 | Envelope em sucesso | `meta.latencyMs` inteiro ≥ 0, `meta.contract = "v1"`, `meta.traceId` não vazio |
| 5 | Envelope em erro | `404` com `data: null`, `error.code = "NOT_FOUND"` e telemetria presente (mesmo em erro) |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 4.1) valida 1–5. Output arquivado em `qa/evidence/chat/smoke-output.txt`.
