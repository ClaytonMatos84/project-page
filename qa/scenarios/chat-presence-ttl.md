# Cenário 4.3 — Presença por TTL: nick some após >10s sem sinal; re-entrada automática

**Spec:** `chat-presence` › "Presença expira por inatividade (TTL)" · `chat-frontend-core` › "Polling, estados de UI e acessibilidade".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos (contrato)

1. `POST /api/chat/rooms/splash/enter` com `{ "nick": "qa_ttl_12345" }` — `online` sobe para 19.
2. **Não** enviar `?nick=` por mais de 10 segundos (o polling é o sinal de vida).
3. `GET /api/chat/rooms/splash/messages?nick=qa_ttl_12345` — o nick não deve estar em `participants`.
4. `GET /api/chat/rooms` — o `online` da Splash Reality decai de volta a 18.

## Passos (UI — re-entrada automática)

1. Entrar em uma sala com apelido no `/bate-papo`.
2. Ocultar a aba por mais de 10s (o polling pausa por `document.hidden`; o TTL expira).
3. Retomar o foco: o polling retoma e o frontend **re-entra automaticamente** com o nick salvo
   (`localStorage`) assim que o nick some de `participants`.
4. **Sair explicitamente** (botão "sair da sala" ou "voltar ao portal"): a UI chama `/leave` e
   encerra a sessão — a reentrada automática por TTL **não** deve disparar depois disso.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Nick presente após entrar | aparece em `participants`; `online` incrementado |
| 2 | Nick silencioso >10s | some de `participants` na próxima resposta; `online` decresce |
| 3 | Nicks de seed | **não** expiram (a lotação "35/40" é do seed — decisão 8) |
| 4 | Re-entrada na UI | ao retomar o foco, o frontend re-entra com o nick salvo antes do próximo render útil |
| 5 | Sem loop | se a re-entrada falhar (apelido tomado), o modal abre com erro em vez de repetir para sempre |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 4.3, com espera de ~11s) valida 1–3.
Os critérios 4–5 são verificados estaticamente por `chat-a11y.mjs` (`awaitingPresenceRef`,
`feed.participants.includes(nick)`, `saveNick`/`getSavedNick`) e no roteiro de demo (`chat-demo.md`).
