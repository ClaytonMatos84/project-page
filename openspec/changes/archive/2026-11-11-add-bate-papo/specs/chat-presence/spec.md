## ADDED Requirements

### Requirement: Entrada em sala com apelido
A API SHALL registrar a presença de um apelido em uma sala via `POST /api/chat/rooms/:id/enter`
com body `{ "nick" }` (regex `^[\w-]{2,24}$`), respondendo 200 com `roomId`, `nick`, `online`
e a lista atualizada de `participants`.

#### Scenario: Entrar em sala com apelido livre
- **WHEN** o cliente chama `POST /api/chat/rooms/arquibancada/enter` com `{ "nick": "visitante_2026" }` e o apelido não está em uso na sala
- **THEN** a API responde 200 com o apelido incluído em `participants` e `online` incrementado

**API Contract**

```http
POST /api/chat/rooms/arquibancada/enter
```

```json
{
  "data": {
    "roomId": "arquibancada",
    "nick": "visitante_2026",
    "online": 36,
    "participants": ["palmeiras_10", "gata_sp_98", "visitante_2026"]
  },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Modal de entrada (`Entrada`, §3.3) antes da primeira participação: campo de apelido com validação
  client-side espelhando o `400`; sem nick não há presença nem envio.
- Erro "apelido em uso" exibido com `role="alert"` e ação de tentar novamente (§4.3).

### Requirement: Entrada em sala inexistente
A API SHALL responder `404` (`NOT_FOUND`) ao entrar em uma sala que não existe.

#### Scenario: Entrar em sala inexistente
- **WHEN** o cliente chama `POST /api/chat/rooms/nao-existe/enter` com `{ "nick": "visitante_2026" }`
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
POST /api/chat/rooms/nao-existe/enter
```

```json
{ "data": null, "error": { "code": "NOT_FOUND", "message": "Room not found" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Apelido inválido ou em uso
A API SHALL responder `400` (`BAD_REQUEST`) quando o apelido não casa `^[\w-]{2,24}$` ou já está
presente na lista de participantes da sala.

#### Scenario: Entrar com apelido já em uso
- **WHEN** o cliente chama `POST /api/chat/rooms/arquibancada/enter` com `{ "nick": "palmeiras_10" }` e esse apelido já está na sala
- **THEN** a API responde 400 com `error.code = "BAD_REQUEST"` e mensagem de apelido em uso

**API Contract**

```http
POST /api/chat/rooms/arquibancada/enter
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "Nick already taken in this room" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Saída explícita da sala
A API SHALL expor `POST /api/chat/rooms/:id/leave` com `{ "nick" }` e remover imediatamente esse
apelido dos participantes da sala, atualizando a contagem `online`; a operação é idempotente para
permitir repetição segura quando o apelido já não estiver presente e responde `404` se a sala não
existir.

#### Scenario: Remover participante ao sair
- **WHEN** o cliente chama `POST /api/chat/rooms/arquibancada/leave` com `{ "nick": "visitante_2026" }`
- **THEN** a API responde 200 com o apelido ausente de `participants` e `online` decrementado, sem manter a presença até o TTL

**API Contract**

```http
POST /api/chat/rooms/arquibancada/leave
Content-Type: application/json
```

```json
{
  "data": {
    "roomId": "arquibancada",
    "nick": "visitante_2026",
    "online": 35,
    "participants": ["palmeiras_10", "gata_sp_98"]
  },
  "meta": { "latencyMs": 3, "contract": "v1" }
}
```

### Requirement: Presença expira por inatividade (TTL)
A API SHALL remover da presença apelidos sem sinal de vida há mais de 10s; o sinal de vida é o
parâmetro `nick` em `GET /api/chat/rooms/:id/messages`, refrescado pelo polling de 3s (§4.2).

#### Scenario: Apelido silencioso sai da sala
- **WHEN** um apelido entra na sala e fica mais de 10s sem aparecer em `?nick=` (ex.: aba oculta pausa o polling)
- **THEN** a próxima resposta de mensagens/participantes não o inclui e o `online` da sala decresce

**API Contract**

```http
GET /api/chat/rooms/arquibancada/messages?nick=visitante_2026
```

```json
{
  "data": { "messages": [], "participants": ["palmeiras_10", "gata_sp_98"] },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Ao retomar o foco durante uma sala ativa, se o nick do usuário sumiu de `participants`, o frontend faz
  **re-entrada automática** com o nick salvo (`localStorage`) antes do próximo render; saída explícita
  encerra essa sessão e não pode disparar reentrada automática.
- Troca rápida de nick na coluna esquerda = novo `enter`; o apelido antigo evapora pelo TTL.
