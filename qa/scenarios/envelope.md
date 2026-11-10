# Cenário 4.1 — Envelope `{ data, meta }` + `latencyMs` (sucesso e erro)

**Spec:** `api-convention` › Requisito "Envelope de resposta único" e "Correlação por traceId".
**Track:** D. **Pré-condição:** API rodando em `:3001`.

## Passos

1. `GET /health` (sucesso).
2. `GET /api/portal/articles/inexistente` (erro 404).

## Critérios de aceite (verificáveis)

| # | Verificação | Sucesso | Erro |
| - | ----------- | ------- | ---- |
| 1 | Top-level tem `data` e `meta` | `data` = objeto | `data` = `null` |
| 2 | `meta.latencyMs` | inteiro ≥ 0 | inteiro ≥ 0 (presente mesmo em erro) |
| 3 | `meta.contract` | `"v1"` | `"v1"` |
| 4 | `meta.traceId` | string não vazia | string não vazia, único por req |
| 5 | `meta.ts` | ISO 8601 válido | ISO 8601 válido |
| 6 | `error` no envelope de erro | ausente | `{ code, message }` |

## Evidência esperada

```
GET /health
{ "data": { "status": "ok", "uptimeMs": 123456, "version": "v1" },
  "meta": { "latencyMs": 1, "contract": "v1", "traceId": "…", "ts": "…" } }

GET /api/portal/articles/inexistente
{ "data": null,
  "error": { "code": "NOT_FOUND", "message": "…" },
  "meta": { "latencyMs": 1, "contract": "v1", "traceId": "…", "ts": "…" } }
```

## Execução

`node qa/scripts/smoke.mjs` — valida automaticamente os critérios 1–6.
