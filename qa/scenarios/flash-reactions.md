# Cenário 4.2 — Reação: `200` incrementado, `404` e dedup na UI

**Spec:** `flash-reactions` › "Reação curta em short" e "Reação em short inexistente" · `flash-frontend-core` › "Rail de ações flutuante".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. `GET /api/flash/shorts` para capturar o `reactions` atual do alvo.
2. `POST /api/flash/shorts/:id/reactions` para um short existente.
3. `POST /api/flash/shorts/nao-existe/reactions`.
4. Na UI (`/flash`), curtir o short visível e tentar curtir de novo.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Reação em short existente | `200` com `{ shortId, count, updatedAt }` |
| 2 | `count` | valor anterior + 1 |
| 3 | Short inexistente | `404` com `data: null`, `error.code = "NOT_FOUND"` e telemetria presente |
| 4 | Dedup na UI | após curtir, o short fica em `localStorage` e o botão desabilita nova curtida neste browser |
| 5 | Contador | atualiza in-place (ação dispara refresh; polling de 3s sincroniza) |
| 6 | A11y | botão com `aria-label` descritivo e `active:scale-95`; contador em `aria-live="polite"` apenas no card visível |

## Evidência esperada

`node qa/scripts/flash-smoke.mjs` valida 1–3 (contrato). Os critérios 4–6 são verificados estaticamente por `node qa/scripts/flash-a11y.mjs` (dedup `localStorage`, `disabled={liked}`, `aria-live` gated).
