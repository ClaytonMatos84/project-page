# Cenário 4.5 — Reservadas visíveis só ao par autor/destinatário

**Spec:** `chat-messages` › "Listar mensagens da sala" (reservadas filtradas no servidor, decisão 4).
**Track:** D. **Pré-condição:** API em `:3001`.

## Passos

1. `GET /api/chat/rooms/paquera/messages?nick=solitaria_99` (autor da reservada do seed) — deve vê-la.
2. `GET /api/chat/rooms/paquera/messages?nick=romantico_sp` (destinatário) — deve vê-la.
3. `GET /api/chat/rooms/paquera/messages?nick=gata_sp_98` (terceiro) — **não** deve vê-la.
4. `GET /api/chat/rooms/paquera/messages` (sem `?nick=`) — nenhuma reservada vaza.
5. Entrar na paquera com um nick novo, enviar uma reservada para `romantico_sp` e repetir 1–3 com os pares dinâmicos.
6. Na UI, entrar como um dos pares e conferir a renderização: fundo amarelo + texto **preto** + badge "reservada".

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Autor | vê a própria reservada |
| 2 | Destinatário | vê a reservada dirigida a ele |
| 3 | Terceiro | **não** vê reservadas de outrem (filtro no servidor, não no cliente) |
| 4 | Espectador (sem `?nick=`) | nenhuma reservada na resposta |
| 5 | Reservada dinâmica | mesmo comportamento 1–3 para mensagens criadas em runtime |
| 6 | Renderização | fundo `--uol-yellow`, texto preto `#000000` (§5.1) e badge "reservada" |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 4.5) valida 1–5. O critério 6 é verificado estaticamente por
`chat-a11y.mjs` (`bg-brand-yellow` + `text-black` + badge) e incluído no roteiro de demo.
