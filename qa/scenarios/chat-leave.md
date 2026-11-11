# Cenário 5.2 — Tela inicial, entrada após seleção e saída explícita

**Spec:** `chat-frontend-core` › "Tela inicial com seleção de sala" e "Sair da sala e encerrar presença" · `chat-presence` › "Saída explícita da sala".
**Track:** D. **Pré-condição:** API em `:3001` (`npm run dev:backend`); frontend em `:3000` (`npm run dev:frontend`).

## Passos (contrato)

1. `POST /api/chat/rooms/devs-opencode/enter` com `{ "nick": "qa_leave_12345" }` — `online` sobe para 13 e o nick entra em `participants`.
2. `POST /api/chat/rooms/devs-opencode/leave` com `{ "nick": "qa_leave_12345" }` — o nick sai de `participants` e `online` volta a 12, sem esperar o TTL.
3. Repetir o `leave` com o mesmo apelido — **idempotente**: `200` e `online` inalterado.
4. `POST /api/chat/rooms/devs-opencode/leave` sem `nick` — `400` `BAD_REQUEST`.
5. `POST /api/chat/rooms/nao-existe/leave` — `404` `NOT_FOUND`.
6. `enter` novamente com o mesmo apelido — `200` (a saída removeu a presença, então **não** recebe `400` de apelido em uso).

## Passos (UI)

1. Abrir `/bate-papo`: tela inicial com **cards** (nome, tópico, `online/capacity`); **nenhuma** sala é escolhida automaticamente.
2. Selecionar um card: só então o modal de apelido abre; confirmar o apelido entra na sala (3 colunas).
3. "sair da sala": chama `/leave`, a presença some na hora e volta à tela inicial; o apelido fica salvo no campo para o próximo modal, mas exige confirmação.
4. "← voltar ao portal" durante a sala: chama `/leave` antes de navegar.
5. Trocar de sala (coluna esquerda): sai da anterior (`/leave`) e re-entra na nova — inclusive quando o apelido ainda estiver presente na sala de destino (o cliente limpa a presença residual com `leave` idempotente), sem cair no `400` de apelido em uso.

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Tela inicial | cards alimentados por `GET /api/chat/rooms`; sem entrada automática |
| 2 | Entrada só após seleção | modal abre ao selecionar o card; confirmação explícita do apelido |
| 3 | Saída remove presença | nick ausente de `participants`; `online` decrementado; sem esperar TTL |
| 4 | Idempotência | `leave` repetido responde `200` sem alterar o estado |
| 5 | Reentrada | mesmo apelido entra de novo **sem** `400` de apelido em uso |
| 6 | Erros | `404` sala inexistente; `400` sem `nick`; envelope + telemetria em tudo |

## Evidência esperada

`node qa/scripts/chat-smoke.mjs` (seção 5.2) valida 3–6. Os critérios 1–2 e a saída no caminho de UI são
verificados estaticamente por `chat-a11y.mjs` e percorridos no roteiro `chat-demo.md`.
