# Cenário 4.2 — Contraste AA em dark e light (incluindo `#FFCE00` ↔ preto)

**Spec:** `design-tokens` › Requisitos "Paleta de marca UOL" e "Superfícies dark e light".
**Track:** D. **Pré-condição:** tokens em `frontend/src/styles/tokens.css`.

## Regra dura

Sobre `--uol-yellow` (`#FFCE00`) o texto é **preto** (`#000000`) — nunca branco.

## Critérios de aceite (WCAG 2.1 AA, texto normal ≥ 4.5:1)

| Papel | Light | Dark | Mínimo |
| ----- | ----- | ---- | ------ |
| Corpo (`--text`) sobre `--bg` | necessário | necessário | 4.5:1 |
| Corpo/telemetria sobre `--surface` | necessário | necessário | 4.5:1 |
| Muted (`--muted`) sobre `--bg` | necessário | necessário | 4.5:1 |
| Texto preto sobre `--uol-yellow` | ≥ 4.5:1 | — | 4.5:1 |
| Branco sobre `--uol-red` | ≥ 4.5:1 | — | 4.5:1 |

> Regra anti-pattern correspondente: **BLOCKER** para texto branco sobre `#FFCE00`.

## Evidência esperada

Saída do script listando par, tema, razão calculada e veredito (PASS/FAIL) por par.

## Execução

`node qa/scripts/contrast.mjs` — lê os tokens reais e calcula as razões de contraste.
