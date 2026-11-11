# Cenário 4.4 — Envio: `201` no feed, `400` validação, `404` sala

**Spec:** `chat-messages` › "Enviar mensagem com ação e destinatário", "Mensagem reservada para Todos" e "Payload de mensagem inválido".
**Track:** D. **Pré-condição:** API em `:3001`; ter entrado em uma sala (autor presente).

## Passos

1. `POST /api/chat/rooms/arquibancada/messages` com `{ author, action: "grita com", recipient: "Todos", text, isPrivate: false }`.
2. Listar a sala e conferir que a mensagem nova aparece (ordem `createdAt` asc).
3. Repetir com `action: "murmura para"` (fora do enum).
4. Repetir com `isPrivate: true` + `recipient: "Todos"` (contradição).
5. Repetir com `recipient: "nao_estou_aqui"` (ausente da sala), texto vazio (só espaços), texto de 501 caracteres e `author` fora da regex.
6. `POST /api/chat/rooms/nao-existe/messages` com payload válido.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Envio válido | `201` com a mensagem criada: `id` e `createdAt` pelo servidor, `reactions` zerado no set canônico (`👍`/`😂`/`❤️` = 0) |
| 2 | Feed | a mensagem aparece na próxima listagem; ordem `createdAt` ascendente; `limit` default 50 (teto 200) |
| 3 | Ação fora do enum | `400` `BAD_REQUEST` ("Invalid action") |
| 4 | Reservada para Todos | `400` `BAD_REQUEST` ("Private message requires a specific recipient") |
| 5 | Destinatário ausente / texto fora de 1–500 / author inválido | `400` `BAD_REQUEST` em todos |
| 6 | Sala inexistente | `404` `NOT_FOUND` com telemetria presente |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 4.4) valida 1–6. O bloqueio client-side espelhando o `400`
(composer desabilita o envio com mensagem inline) é verificado estaticamente em `chat-a11y.mjs`.
