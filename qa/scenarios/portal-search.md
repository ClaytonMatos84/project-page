# Cenário 4.4 — Busca: resultado, vazio e `400` sem termo

**Spec:** `portal-search` › "Busca simples de conteúdo" e "Requisição de busca inválida".
**Track:** D. **Pré-condição:** API em `:3001`.

## Passos

1. `GET /api/portal/search?q=EconomIA`.
2. `GET /api/portal/search?q=zzzznaoexiste`.
3. `GET /api/portal/search` (sem `q`) e `?q=` (vazio).

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Case-insensitive | `q=EconomIA` retorna ≥ 1 artigo (match em `title`+`summary`) |
| 2 | Forma | resultados na forma de `Article` |
| 3 | Sem correspondência | `200` com `data: []` |
| 4 | Sem/vazio `q` | `400` com `data: null` + `error.code = "BAD_REQUEST"` |
| 5 | UI — vazio | estado dedicado com orientação |
| 6 | UI — erro | `role="alert"` no erro crítico |

## Evidência esperada

`node qa/scripts/portal-smoke.mjs` valida os critérios 1–4; `SearchPage` cobre 5–6.
