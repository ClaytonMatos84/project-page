# Cenário 4.2 — Entrada em sala: `200`, `400` apelido em uso/inválido, `404` sala

**Spec:** `chat-presence` › "Entrada em sala com apelido", "Entrada em sala inexistente" e "Apelido inválido ou em uso".
**Track:** D. **Pré-condição:** API em `:3001`.

## Passos

1. `POST /api/chat/rooms/arquibancada/enter` com `{ "nick": "qa_smoke_12345" }` (apelido livre).
2. `POST /api/chat/rooms/arquibancada/enter` com `{ "nick": "palmeiras_10" }` (apelido do seed, em uso).
3. `POST /api/chat/rooms/arquibancada/enter` com `{ "nick": "x!" }` (fora de `^[\w-]{2,24}$`).
4. `POST /api/chat/rooms/nao-existe/enter` com apelido válido.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Entrada com apelido livre | `200` com `roomId`, `nick`, `online` incrementado (36) e `participants` incluindo o nick |
| 2 | Apelido em uso | `400` com `error.code = "BAD_REQUEST"` e mensagem de apelido em uso |
| 3 | Apelido inválido | `400` com `BAD_REQUEST` (regex `^\[\w-\]{2,24}$`) |
| 4 | Sala inexistente | `404` com `data: null`, `NOT_FOUND` e telemetria presente |
| 5 | Envelope | telemetria completa em sucesso e em erro |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 4.2) valida 1–5. Na UI, o modal de entrada exibe o erro
"apelido em uso" com `role="alert"` (verificado estaticamente em `chat-a11y.mjs`).
