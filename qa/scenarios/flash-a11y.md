# Cenário 4.6 — Acessibilidade: teclado, focus trap, `aria-live` e contraste AA

**Spec:** `flash-frontend-core` › "Navegação por teclado no feed", "Estados de UI do feed", "Rail de ações flutuante", "Bottom sheet da matéria completa", "Modal de publicação de short" · `design-tokens` (§5).
**Track:** D. **Pré-condição:** frontend em `:3000`; API em `:3001`.

## Passos

1. Em `/flash`, navegar com as setas ↑/↓ do teclado.
2. Abrir o bottom sheet "Ler Matéria Completa" e o modal de publicação; percorrer com `Tab`/`Shift+Tab`; fechar com `Esc`.
3. Observar os contadores de curtida/enquete durante o polling.
4. Alternar tema dark/light e inspecionar chips de editoria, badge e botão Publicar (amarelo).

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Teclado no feed | setas ↑/↓ rolam com snap; região rotulada; `prefers-reduced-motion` desliga a rolagem suave |
| 2 | Focus trap | `Tab`/`Shift+Tab` circulam dentro do sheet e do modal; `Esc` fecha; foco retorna ao gatilho |
| 3 | `aria-live` | `polite` **apenas** na região de contadores do card visível (curtida e enquete), nunca no feed inteiro |
| 4 | Contraste AA | texto sobre fundo em dark e light ≥ 4.5:1 |
| 5 | Regra dura (§5.1) | amarelo `#FFCE00` sempre com texto **preto** (botão Publicar) |
| 6 | Chips de editoria | branco sobre noticias/esportes/economia/tecnologia; **preto** sobre entretenimento (laranja) — todos ≥ 4.5:1 |
| 7 | Scrim | título/resumo brancos sobre scrim ≥ 90% preto na base do card |
| 8 | Estados | loading com skeleton (`role="status"`); erro com `role="alert"` + "tentar novamente"; vazio com orientação |
| 9 | Vídeo (quando houver) | `muted` + `playsInline` + pausa via IntersectionObserver fora da viewport |

## Evidência esperada

`node qa/scripts/flash-a11y.mjs` valida os pares de contraste a partir dos tokens reais (dark/light, amarelo+preto, chips por editoria, scrim) e verifica estaticamente teclado, focus trap, `aria-live` gated, dedup e polling com cleanup.
