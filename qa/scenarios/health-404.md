# Cenário 4.3 — `/health` respondendo e `404` no formato padrão

**Spec:** `api-convention` › Requisitos "Health check" e "Contrato de erro padronizado".
**Track:** D. **Pré-condição:** API rodando em `:3001`.

## Passos

1. `GET /health`.
2. `GET /api/portal/articles/inexistente`.
3. `OPTIONS /api/portal/highlights` com `Origin: http://localhost:3000`.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | `GET /health` status | `200` |
| 2 | `data.status` | `"ok"` |
| 3 | `data.uptimeMs` | número ≥ 0 |
| 4 | `data.version` | `"v1"` |
| 5 | `404` status | `404` |
| 6 | `404` corpo | `data: null` + `error.code = "NOT_FOUND"` + `error.message` |
| 7 | `404` telemetria | `meta.latencyMs` e `meta.traceId` presentes |
| 8 | CORS | `Access-Control-Allow-Origin: *` |
| 9 | charset | `Content-Type: application/json; charset=utf-8` |

## Execução

`node qa/scripts/smoke.mjs` — cobre os critérios 1–9.
