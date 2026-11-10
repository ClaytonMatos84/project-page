# Cenário 4.1 — Feed `recent`/`popular` + polling de 3s com cleanup

**Spec:** `flash-shorts` › "Feed de shorts" e "Ordenação por popularidade" · `flash-frontend-core` › "Polling do feed com contadores in-place".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. `GET /api/flash/shorts?sort=recent&limit=20` (contrato).
2. `GET /api/flash/shorts?sort=popular` (contrato).
3. Abrir `/flash` e aguardar ≥ 2 ciclos de polling de 3s.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Status/envelope | `200`, `{ data, meta }` |
| 2 | Cada short | `id`, `title`, `body`, `durationMs` (int > 0), `editoria` canônica, `reactions`, `createdAt`, `mediaUrl`, `mediaType` (`image`\|`video`), `articleUrl?`, `poll?` |
| 3 | `sort=recent` | `createdAt` desc (default) |
| 4 | `sort=popular` | `reactions` desc |
| 5 | `limit` | default 20; `limit=2` retorna 2 |
| 6 | Seed | 6 shorts cobrindo as 5 editorias canônicas; mídia picsum `720/1280` |
| 7 | Telemetria | `meta.latencyMs`/`meta.traceId`/`meta.contract="v1"` |
| 8 | Polling (frontend) | rebusca a cada 3s; `clearInterval` no unmount; pausa com aba oculta (`document.hidden`); sem `setState` após unmount |
| 9 | Contadores in-place | `key={short.id}` estável; polling atualiza contadores sem remontar cards, perder o snap ou reordenar o feed |
| 10 | Reordenação | apenas por ação explícita no toggle Recentes/Mais curtidos |

## Evidência esperada

`node qa/scripts/flash-smoke.mjs` valida 1–7 (contrato). Os critérios 8–10 são verificados estaticamente por `node qa/scripts/flash-a11y.mjs` e por inspeção de `frontend/src/lib/usePolling.ts` e `frontend/src/pages/FlashPage.tsx` (merge in-place com ordem autoritativa).
