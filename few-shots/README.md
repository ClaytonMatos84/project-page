# few-shots/ — Gabarito de padrões (obrigatório)

Este diretório contém **exemplos e padrões-ouro** que **todos os agentes** devem respeitar
ao revisar ou implementar os protótipos da UOL. Antes de qualquer review, leia:

1. `../AGENTS.md` §2 (Design System UOL) — **normativo**.
2. Os arquivos abaixo.

> Regra: se um exemplo aqui conflitar com o `AGENTS.md`, **o `AGENTS.md` vence**.
> Se encontrar divergência entre um artefato e um exemplo, **reporte** — não copie o erro.

## Índice

| Arquivo | O que é | Quando usar |
|---|---|---|
| [`design-tokens.css`](./design-tokens.css) | Tokens canônicos (CSS variables) da paleta/tipografia/espaço | Base de qualquer CSS; conferir cores/medidas |
| [`gold-standard-card.html`](./gold-standard-card.html) | Componente de referência: card de notícia + kicker + selo premium + a11y | Comparar estrutura/estilo de cards, badges e botões |
| [`review-report.example.md`](./review-report.example.md) | Exemplo de **bom** relatório de review (formato §5) | Modelo de saída para todos os agentes |
| [`anti-patterns.md`](./anti-patterns.md) | Lista do que **nunca** fazer | Checklist rápido de erros recorrentes |

## Princípios não negociáveis (resumo)

- **Paleta:** só `#CB0003`, `#ED5709`, `#005FFF`, `#FFCE00` + neutros do `AGENTS.md`.
- **Acento único de ação:** vermelho `#CB0003`. Amarelo `#FFCE00` **exclusivo** de premium.
- **Tipografia:** Montserrat (manchetes 700–900) + UOLText (corpo) com fallback.
- **Contraste AA:** texto preto sobre amarelo; branco sobre vermelho.
- **Minimalismo:** sem gradientes off-brand, neon, sombras pesadas ou decoração sem função.
- **Créditos:** manter menção de que a paleta se baseia em uol.com.br / Manual da Marca UOL.
