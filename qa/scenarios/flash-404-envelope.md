# Cenário 4.5 — `404` no detalhe + envelope `{ data, meta }` em todos os endpoints

**Spec:** `flash-shorts` › "Detalhe do short" · `api-convention` (uol-foundation).
**Track:** D. **Pré-condição:** API em `:3001`.

## Passos

1. `GET /api/flash/shorts/:id` com id existente.
2. `GET /api/flash/shorts/nao-existe`.
3. Conferir envelope e telemetria em **todos** os endpoints do flash (feed, detalhe, publicação, reação, voto), inclusive nas respostas de erro.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Detalhe existente | `200` com short completo no `data` |
| 2 | Detalhe inexistente | `404` com `{ data: null, error: { code: "NOT_FOUND", message: "..." }, meta: {...} }` |
| 3 | Telemetria em erro | `meta.latencyMs` (int ≥ 0), `meta.contract = "v1"`, `meta.traceId` presentes mesmo em `400`/`404` |
| 4 | Content-Type | `application/json; charset=utf-8` em sucesso e erro |
| 5 | Envelope único | nenhum endpoint do flash responde fora do formato `{ data, meta }` |

## Evidência esperada

`node qa/scripts/flash-smoke.mjs` valida 1–5 em todos os endpoints do flash (cada bloco confere `hasTelemetry` inclusive nos erros).
