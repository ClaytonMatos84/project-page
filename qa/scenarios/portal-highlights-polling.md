# Cenário 4.1 — `GET /api/portal/highlights` + polling de 3s com cleanup

**Spec:** `portal-highlights` › "Destaques da home" e "Atualização automática da home" · `portal-frontend-core` › "Polling de 3s com cleanup".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. `GET /api/portal/highlights` (contrato).
2. Montar a `Home` e aguardar ≥ 2 ciclos de polling de 3s.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Status/envelope | `200`, `{ data, meta }` |
| 2 | Cada destaque | `articleId`, `position` (int), `label`, `article` embutido (`id`, `title`, `summary`, `editoria`, `imageUrl`) |
| 3 | `article.id === articleId` | verdadeiro (sem N+1) |
| 4 | Ordenação | `position` crescente |
| 5 | Telemetria | `meta.latencyMs`/`meta.traceId`/`meta.contract="v1"` |
| 6 | Polling (frontend) | rebusca a cada 3s; `clearInterval` no unmount; sem `setState` após unmount |
| 7 | Região atualizada | `aria-live="polite"` no bloco de destaques |

## Evidência esperada

`node qa/scripts/portal-smoke.mjs` valida os critérios 1–5 (contrato) e imprime o resultado por verificação. Os critérios 6–7 são verificados estaticamente por `node qa/scripts/portal-a11y.mjs` e por inspeção de `frontend/src/lib/usePolling.ts`.
