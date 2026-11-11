# Cenário 4.6 — Reação: `200` incrementado, `400` emoji, `404` mensagem, dedup na UI

**Spec:** `chat-reactions` › "Reagir a uma mensagem", "Reação com emoji fora do set" e "Reação em mensagem inexistente".
**Track:** D. **Pré-condição:** API em `:3001`; frontend em `:3000`.

## Passos

1. `GET` da sala para capturar o `reactions` atual da mensagem-alvo (ex.: da `gata_sp_98` na paquera).
2. `POST /api/chat/messages/:id/react` com `{ "emoji": "😂" }`.
3. `POST /api/chat/messages/:id/react` com `{ "emoji": "🎉" }` (fora do set canônico).
4. `POST /api/chat/messages/nao-existe/react` com `{ "emoji": "👍" }`.
5. Na UI (`/bate-papo`), reagir com `😂` e tentar reagir de novo com o mesmo emoji.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Reação válida | `200` com a mensagem atualizada e o contador do emoji incrementado em relação ao valor anterior |
| 2 | Emoji fora do set | `400` `BAD_REQUEST` ("Invalid emoji") |
| 3 | Mensagem inexistente | `404` `NOT_FOUND` ("Message not found") com telemetria presente |
| 4 | Dedup na UI | 1 reação por emoji por mensagem por browser (`localStorage`); o botão desabilita nova reação |
| 5 | Contadores | atualizam in-place pelo polling com `key={message.id}` estável (feed não remonta) |
| 6 | A11y | botões com `aria-label` descritivo ("rir da mensagem"), `active:scale-95`; emojis são funcionais (§5.6) |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 4.6) valida 1–3. Os critérios 4–6 são verificados
estaticamente por `node qa/scripts/chat-a11y.mjs` (`markReacted`/`hasReacted`, `disabled={reacted}`,
`key={message.id}`, `aria-label`).
