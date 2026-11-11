# Cenário 4.7 — Polling de 3s com cleanup + navegação bidirecional

**Spec:** `chat-frontend-core` › "Polling, estados de UI e acessibilidade" e "Navegação bidirecional com o portal" · AGENTS.md §4.2.
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. Abrir `http://localhost:3000/` e clicar em **"Bate-Papo"** no Header (ao lado de "Flash").
2. Entrar com apelido e observar os 2 pollers: salas/lotação (esquerda) e mensagens/participantes com
   `?nick=` (centro/direita), ambos de 3s.
3. Enviar uma mensagem pela UI e conferir que ela aparece no feed sem recarregar a página.
4. Ocultar a aba (o polling pausa por `document.hidden`) e retomar — o polling retoma sem intervalos órfãos.
5. Clicar em **"sair da sala"** — a UI chama `POST /api/chat/rooms/:id/leave` e volta à tela inicial.
6. Clicar em **"← voltar ao portal"** já dentro de uma sala — a UI chama `/leave` antes de navegar.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Navegação portal → chat | Header do portal linka `/bate-papo`; a rota fica fora do `Layout` (precedente `/flash`) |
| 2 | Navegação chat → portal | "← voltar ao portal" leva a `/` do Mini Portal |
| 3 | Pollers | 2 instâncias de `usePolling` (3s): salas; feed + participantes piggyback com `?nick=` (sinal de vida do TTL) |
| 4 | Cleanup | `clearInterval` no unmount, `setState` bloqueado após desmontar (`aliveRef`), sem intervalos órfãos |
| 5 | Aba oculta | polling pausa em `document.hidden` e retoma ao focar (reuso de `usePolling`) |
| 6 | Atualização in-place | contadores de reação e presença atualizam sem remontar o feed (`key={message.id}`) |
| 7 | Saída/navegação | "sair da sala" e "voltar ao portal" chamam `/leave`; sem reentrada por TTL após a saída |

## Evidência esperada

`node qa/scripts/chat-a11y.mjs` valida 1–6 estaticamente (2 `usePolling`, `visibilitychange`,
`clearInterval`, `aliveRef`, links de navegação). O comportamento ao vivo é percorrido no roteiro
de demo (`chat-demo.md`).
