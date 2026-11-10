# Cenário 4.3 — Voto: `200` consistente, `400`/`404` e percentuais na UI

**Spec:** `flash-polls` › "Enquete embutida no short", "Voto em enquete" e "Validação do voto" · `flash-frontend-core` › "Enquete interativa sobre a mídia".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. `GET /api/flash/shorts` e localizar um short **com** enquete e um **sem** enquete (o seed tem ambos).
2. `POST /api/flash/shorts/:id/vote` com `{ optionId }` válido.
3. `POST /vote` com `optionId` inexistente; com body sem `optionId`; em short sem enquete; em short inexistente.
4. Na UI, votar na enquete do short visível e conferir percentuais.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Voto válido | `200` com o `poll` atualizado (`question`, `options[{id,label,votes}]`, `totalVotes`) |
| 2 | Consistência | `totalVotes` = soma dos `votes` das opções; opção votada incrementada |
| 3 | Opção inválida/ausente | `400` `BAD_REQUEST`, `data: null`, nenhum contador alterado |
| 4 | Short sem enquete | `400` `BAD_REQUEST` |
| 5 | Short inexistente | `404` `NOT_FOUND` com telemetria |
| 6 | UI: percentuais | barras na cor da editoria com percentual = `votes/totalVotes` por opção |
| 7 | UI: dedup | 1 voto por short por browser (`localStorage`); após votar, exibe resultados e trava nova votação |
| 8 | UI: a11y | resultados em `aria-live="polite"` apenas no card visível; barras com contraste AA |

## Evidência esperada

`node qa/scripts/flash-smoke.mjs` valida 1–5 (contrato). Os critérios 6–8 são verificados estaticamente por `node qa/scripts/flash-a11y.mjs` (percentuais no cliente, dedup, `aria-live` gated, contraste dos chips).
