# chat-messages

## Purpose
Define the Bate-Papo UOL Next-Gen messages capability: listing, sending (with action/recipient), private messages, and validation errors.

## Requirements

### Requirement: Listar mensagens da sala
A API SHALL devolver via `GET /api/chat/rooms/:id/messages?nick=&limit=` as últimas `limit`
mensagens (default 50, teto 200, ordem `createdAt` ascendente) **e** a lista de `participants`
da sala; mensagens reservadas (`isPrivate: true`) só aparecem quando `nick` é autor ou
destinatário; `nick` refresca o TTL de presença.

#### Scenario: Listar mensagens com reservadas filtradas
- **WHEN** o cliente chama `GET /api/chat/rooms/paquera/messages?nick=romantico_sp`
- **THEN** a API responde 200 com `{ "data": { "messages", "participants" } }` incluindo as reservadas em que `romantico_sp` é autor ou destinatário e **excluindo** reservadas de terceiros

**API Contract**

```http
GET /api/chat/rooms/paquera/messages?nick=romantico_sp&limit=50
```

```json
{
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "roomId": "paquera",
        "author": "gata_sp_98",
        "action": "fala para",
        "recipient": "Todos",
        "text": "oi galera, alguém de SP?",
        "isPrivate": false,
        "reactions": { "👍": 3, "😂": 1, "❤️": 2 },
        "createdAt": "2026-11-10T12:00:00.000Z"
      }
    ],
    "participants": ["gata_sp_98", "romantico_sp", "solitaria_99"]
  },
  "meta": { "latencyMs": 5, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Feed com `role="log"` (região live polite implícita); mensagens novas entram no fim sem
  reler o histórico; timestamps em JetBrains Mono (§5.3).
- Estado vazio dedicado ("sala silenciosa, seja o primeiro a falar") com orientação (§4.3).

### Requirement: Enviar mensagem com ação e destinatário
A API SHALL criar mensagem via `POST /api/chat/rooms/:id/messages` com `author`, `action`
(`fala para`|`grita com`|`sussurra para`|`concorda com`), `recipient` (`Todos` ou nick presente
na sala), `text` (1–500 após trim) e `isPrivate` (booleano), respondendo `201` com a mensagem
criada (`id`, `roomId`, `reactions` zerado e `createdAt` atribuídos pelo servidor).

#### Scenario: Enviar grito público para Todos
- **WHEN** o cliente chama `POST /api/chat/rooms/arquibancada/messages` com `{ "author": "visitante_2026", "action": "grita com", "recipient": "Todos", "text": "GOL NO ÚLTIMO MINUTO!!!", "isPrivate": false }`
- **THEN** a API responde 201 com a mensagem criada e ela aparece na próxima listagem da sala

**API Contract**

```http
POST /api/chat/rooms/arquibancada/messages
```

```json
{
  "data": {
    "id": "msg-42",
    "roomId": "arquibancada",
    "author": "visitante_2026",
    "action": "grita com",
    "recipient": "Todos",
    "text": "GOL NO ÚLTIMO MINUTO!!!",
    "isPrivate": false,
    "reactions": { "👍": 0, "😂": 0, "❤️": 0 },
    "createdAt": "2026-11-10T12:00:05.000Z"
  },
  "meta": { "latencyMs": 4, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Barra clássica inferior: seletor de **Ação** + seletor de **Destinatário** + checkbox
  **"Reservadamente"** + campo de texto + Enviar; `active:scale-95` e foco visível (§5.5).
- Renderização por ação: `fala para` = nick em bold; `grita com` = texto em **caixa alta +
  vermelho UOL**; `sussurra para` = itálico muted; `concorda com` = azul `#005FFF`;
  reservada = fundo `--uol-yellow` com texto **preto** (§5.1) + badge "reservada".

### Requirement: Mensagem reservada para Todos
A API SHALL responder `400` (`BAD_REQUEST`) quando `isPrivate: true` e `recipient: "Todos"`
(contradição — reservada exige destinatário específico).

#### Scenario: Enviar reservada para Todos
- **WHEN** o cliente chama `POST /api/chat/rooms/paquera/messages` com `{ "author": "romantico_sp", "action": "sussurra para", "recipient": "Todos", "text": "psst...", "isPrivate": true }`
- **THEN** a API responde 400 com `error.code = "BAD_REQUEST"` e mensagem de reservada exige destinatário

**API Contract**

```http
POST /api/chat/rooms/paquera/messages
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "Private message requires a specific recipient" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

**UI & Aesthetic Contract**

- O checkbox "Reservadamente" com `recipient = Todos` desabilita o Enviar com mensagem inline
  (validação client-side espelhando o `400`, §4.3).

### Requirement: Payload de mensagem inválido
A API SHALL responder `400` (`BAD_REQUEST`) quando `action` fora do enum, `text` vazio ou maior
que 500, `author` fora de `^[\w-]{2,24}$`, ou `recipient` não é `"Todos"` nem nick presente na
lista de participantes da sala.

#### Scenario: Enviar com ação fora do enum
- **WHEN** o cliente chama `POST /api/chat/rooms/arquibancada/messages` com `{ "author": "visitante_2026", "action": "murmura para", "recipient": "Todos", "text": "oi", "isPrivate": false }`
- **THEN** a API responde 400 com `error.code = "BAD_REQUEST"` e mensagem de ação inválida

**API Contract**

```http
POST /api/chat/rooms/arquibancada/messages
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "Invalid action" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Mensagens de sala inexistente
A API SHALL responder `404` (`NOT_FOUND`) em `GET`/`POST` de mensagens de uma sala que não existe.

#### Scenario: Listar mensagens de sala inexistente
- **WHEN** o cliente chama `GET /api/chat/rooms/nao-existe/messages`
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
GET /api/chat/rooms/nao-existe/messages
```

```json
{ "data": null, "error": { "code": "NOT_FOUND", "message": "Room not found" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```
