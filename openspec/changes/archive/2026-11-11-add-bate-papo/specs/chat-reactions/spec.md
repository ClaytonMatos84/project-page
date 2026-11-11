## ADDED Requirements

### Requirement: Reagir a uma mensagem
A API SHALL incrementar a reação de uma mensagem via `POST /api/chat/messages/:id/react` com
body `{ "emoji" }` do set canônico `👍`/`😂`/`❤️`, respondendo 200 com a mensagem atualizada
(`reactions: Record<string, number>`).

#### Scenario: Rir de uma mensagem
- **WHEN** o cliente chama `POST /api/chat/messages/msg-1/react` com `{ "emoji": "😂" }` para uma mensagem existente
- **THEN** a API responde 200 com a mensagem e o contador de `😂` incrementado em relação ao valor anterior

**API Contract**

```http
POST /api/chat/messages/msg-1/react
```

```json
{
  "data": {
    "id": "msg-1",
    "roomId": "paquera",
    "author": "gata_sp_98",
    "action": "fala para",
    "recipient": "Todos",
    "text": "oi galera, alguém de SP?",
    "isPrivate": false,
    "reactions": { "👍": 3, "😂": 2, "❤️": 2 },
    "createdAt": "2026-11-10T12:00:00.000Z"
  },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Botões de reação por mensagem com `active:scale-95` e `aria-label`; emojis são **funcionais**
  (conteúdo da reação), não decorativos — anti-slop (§5.6) ok.
- Dedup por browser: após reagir, o frontend guarda a mensagem no `localStorage` e desabilita
  nova reação (precedente do flash — contrato apenas incrementa).
- Contadores atualizados in-place pelo polling, com `key={message.id}` estável.

### Requirement: Reação com emoji fora do set
A API SHALL responder `400` (`BAD_REQUEST`) quando o `emoji` do body não pertence ao set
canônico `👍`/`😂`/`❤️`.

#### Scenario: Reagir com emoji não suportado
- **WHEN** o cliente chama `POST /api/chat/messages/msg-1/react` com `{ "emoji": "🎉" }`
- **THEN** a API responde 400 com `error.code = "BAD_REQUEST"` e mensagem de emoji inválido

**API Contract**

```http
POST /api/chat/messages/msg-1/react
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "Invalid emoji" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Reação em mensagem inexistente
A API SHALL responder `404` (`NOT_FOUND`) ao reagir a uma mensagem que não existe.

#### Scenario: Reagir a mensagem inexistente
- **WHEN** o cliente chama `POST /api/chat/messages/nao-existe/react` com `{ "emoji": "👍" }`
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
POST /api/chat/messages/nao-existe/react
```

```json
{ "data": null, "error": { "code": "NOT_FOUND", "message": "Message not found" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```
