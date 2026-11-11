# Cenário 4.8 — Acessibilidade AA no `/bate-papo`

**Spec:** `chat-frontend-core` › "Polling, estados de UI e acessibilidade" · `design-tokens` (§5.1/§5.3/§5.4/§5.5).
**Track:** D. **Pré-condição:** frontend em `:3000`; API em `:3001`.

## Passos

1. Navegar pelo `/bate-papo` apenas com teclado: abrir o modal, digitar apelido, `Tab`/`Shift+Tab`
   (focus trap), `Esc` (fecha), enviar mensagem com `Enter`.
2. Conferir o feed com leitor de tela: `role="log"` anuncia as mensagens novas sem reler o histórico.
3. Conferir o contador de online: `aria-live="polite"` na coluna de participantes.
4. Alternar dark/light com o `ThemeToggle` e conferir o contraste (incluindo grito em vermelho,
   "concorda com" em azul e a reservada em amarelo com texto **preto**).

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Feed | `role="log"` com `aria-label`; mensagens novas entram no fim |
| 2 | Contador de online | `aria-live="polite"` |
| 3 | Modal de entrada | `role="dialog"` + `aria-modal`, focus trap, `Esc` fecha, foco retorna ao gatilho |
| 4 | Erros | erro de apelido em uso com `role="alert"`; bloqueio de reservada para Todos com mensagem inline |
| 5 | Teclado | foco visível (`:focus-visible` em `--uol-blue`), Enter envia, todos os controles navegáveis |
| 6 | Contraste AA | ≥ 4.5:1 em dark e light: texto/fundo, preto/amarelo (reservada), vermelho-texto (grito), azul-texto (concorda), muted (sussurra) |
| 7 | Micro-interações | `active:scale-95` em botões; `animate-ping` no indicador ao vivo do banner (§5.5) |
| 8 | Rotulagem | participantes com `aria-label` "conversar com {nick}"; reações com aria-label descritivo |

## Evidência esperada

`node qa/scripts/chat-a11y.mjs` valida 1–8 (contraste calculado dos tokens reais + checagens
estáticas de ARIA/teclado). Output arquivado em `qa/evidence/chat/a11y-output.txt`.
