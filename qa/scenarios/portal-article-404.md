# Cenário 4.3 — Detalhe `404` no formato padrão

**Spec:** `portal-articles` › "Detalhe do artigo".
**Track:** D. **Pré-condição:** API em `:3001`.

## Passos

1. `GET /api/portal/articles/art-1` (existe).
2. `GET /api/portal/articles/nao-existe` (não existe).
3. Abrir a tela `Leitura` (`/leitura/nao-existe`).

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Detalhe válido | `200`, forma de `Article`, `url = /leitura/art-1` |
| 2 | Não existente | `404` |
| 3 | Corpo do erro | `{ "data": null, "error": { "code": "NOT_FOUND", "message": "…" }, "meta": {…} }` |
| 4 | Telemetria em erro | `meta.latencyMs` e `meta.traceId` presentes |
| 5 | UI (§4.3) | mensagem clara + ação "tentar novamente"/"Voltar" |

## Evidência esperada

`node qa/scripts/portal-smoke.mjs` valida os critérios 1–4; a tela `LeituraPage` trata `404` com estado dedicado.
