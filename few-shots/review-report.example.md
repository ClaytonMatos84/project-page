# Review — Visual & Brand Director — mini-portal-uol.html — 2026-11-09

> **Exemplo de bom relatório** (formato §5 do `AGENTS.md`). Repare em:
> IDs, severidade correta, localização precisa, correção **concreta** e referência à §.

## Resumo
- Veredito do agente: **BLOCK**
- Achados: **1 BLOCKER · 2 MAJOR · 1 MINOR · 1 NIT**

## Achados
| ID | Sev | Local (arquivo:linha/selector) | Problema | Correção sugerida | Ref. |
|----|-----|-------------------------------|----------|-------------------|------|
| VD-01 | BLOCKER | `mini-portal-uol.html` · `.hero-main` | Gradiente usa `#6f2dbd` (roxo) fora da paleta de marca | Trocar por `linear-gradient(135deg, var(--uol-red), var(--uol-orange))` | §2.1 / `design-tokens.css` |
| VD-02 | MAJOR | `.card-body h3` | Manchete em `font-weight:600` — hierarquia fraca vs. UOL (usa 800–900) | `font-weight:800` e `letter-spacing:-.3px` (Montserrat) | §2.3 / `gold-standard-card.html` |
| VD-03 | MAJOR | `.section-label` | Kicker sem `letter-spacing` — perde o "ritmo" UOL | Adicionar `letter-spacing:1.4px; text-transform:uppercase` | §2.3 |
| VD-04 | MINOR | `.chip.active` | Hover do chip ativo não muda de tom | `hover: background var(--uol-red-dark)` | §2.7 |
| VD-05 | NIT | `.footer` | Texto de crédito com pontuação dupla ("..") | Corrigir para ponto final único | §2.10 |

## Scorecard
| Critério | Nota 0–5 | Comentário |
|---|---|---|
| Paleta | 2 | Roxo off-brand no hero (VD-01) |
| Tipografia | 3 | Hierarquia de manchete fraca (VD-02, VD-03) |
| Espaçamento | 4 | Respiro bom; alinhamentos consistentes |
| Hierarquia visual | 3 | Foco do olho correto, mas manchete subdimensionada |
| Polimento | 4 | Raios/sombras coerentes; dark mode íntegro |
| Consistência (3 telas) | 4 | Sistema visual alinhado entre protótipos |
| Minimalismo | 5 | Sem ruído; ótimo |

**Média: 3.6 → reprovado** (exige ≥ 4 em todos os critérios para SHIP, §7).

## Próximo passo (handoff → Orchestrator)
- Bloquear ship por `VD-01`; priorizar `VD-02/03` (MAJOR). Reaplicar após correções.
