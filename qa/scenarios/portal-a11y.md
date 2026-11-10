# Cenário 4.5 — Acessibilidade AA + `aria-live` em dark e light

**Spec:** `portal-frontend-core` › "Acessibilidade AA" · `API`/`Design` §4.3/§5.
**Track:** D. **Pré-condição:** tokens em `frontend/src/styles/tokens.css`.

## Critérios de aceite (WCAG 2.1 AA, texto normal ≥ 4.5:1)

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Corpo sobre fundo (light e dark) | ≥ 4.5:1 |
| 2 | Corpo sobre superfície (light e dark) | ≥ 4.5:1 |
| 3 | Muted sobre fundo | ≥ 4.5:1 |
| 4 | Preto sobre `--uol-yellow` | ≥ 4.5:1 (regra dura; branco sobre amarelo é proibido) |
| 5 | Branco sobre `--uol-red` | ≥ 4.5:1 |
| 6 | Região de polling | `aria-live="polite"` |
| 7 | Erro crítico | `role="alert"`; foco visível; navegação por teclado |

## Evidência esperada

`node qa/scripts/portal-a11y.mjs` valida 1–7 lendo os tokens e os componentes reais e imprime PASS/FAIL por verificação.
