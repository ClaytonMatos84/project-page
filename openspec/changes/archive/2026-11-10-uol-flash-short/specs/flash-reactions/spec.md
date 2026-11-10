## ADDED Requirements

### Requirement: Reação curta em short
A API SHALL incrementar a contagem de reações de um short via `POST /api/flash/shorts/:id/reactions`,
respondendo 200 com a entidade `Reaction` atualizada (`shortId`, `count`, `updatedAt`).

#### Scenario: Curtir um short
- **WHEN** o cliente chama `POST /api/flash/shorts/:id/reactions` para um short existente
- **THEN** a API responde 200 com `{ "data": { "shortId", "count", "updatedAt" } }` e o `count` incrementado em relação ao valor anterior

**API Contract**

```http
POST /api/flash/shorts/:id/reactions
```

```json
{
  "data": { "shortId": "short-1", "count": 129, "updatedAt": "2026-11-10T12:00:01.000Z" },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Botão de curtida no rail com `active:scale-95` e `aria-label`; contagem atualizada in-place pelo polling.
- Dedup por browser: após curtir, o frontend guarda o short em `localStorage` e desabilita nova curtida (decisão de design — contrato apenas incrementa).

### Requirement: Reação em short inexistente
A API SHALL responder `404` (`NOT_FOUND`) ao reagir a um short que não existe.

#### Scenario: Curtir short inexistente
- **WHEN** o cliente chama `POST /api/flash/shorts/:id/reactions` com um `id` que não existe
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
POST /api/flash/shorts/nao-existe/reactions
```

```json
{ "data": null, "error": { "code": "NOT_FOUND", "message": "Short not found" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```
