# flash-polls

## Purpose
Define embedded polls and voting behavior for UOL Flash Shorts.

## Requirements

### Requirement: Enquete embutida no short
O contrato SHALL embutir a enquete no short (`poll` opcional) com `question`, `options` (cada uma com `id`, `label`, `votes`) e `totalVotes`, evitando N+1 no feed.

#### Scenario: Feed retorna short com enquete
- **WHEN** o cliente chama `GET /api/flash/shorts` e um short possui enquete
- **THEN** o short SHALL conter `poll` com `question`, `options` (array de `{ id, label, votes }`) e `totalVotes` consistente com a soma dos votos das opções

**API Contract**

```http
GET /api/flash/shorts/:id
```

```json
{
  "data": {
    "id": "short-2",
    "poll": {
      "question": "Você vai assistir à final?",
      "options": [
        { "id": "opt-1", "label": "Sim", "votes": 34 },
        { "id": "opt-2", "label": "Não", "votes": 6 }
      ],
      "totalVotes": 40
    }
  },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Enquete renderizada sobre a mídia; barras de resultado na cor da editoria com contraste AA.
- Percentuais calculados no cliente a partir de `votes`/`totalVotes`.

### Requirement: Voto em enquete
A API SHALL registrar voto via `POST /api/flash/shorts/:id/vote` com body `{ "optionId": "..." }`, incrementando `votes` da opção e `totalVotes`, e respondendo 200 com o `poll` atualizado.

#### Scenario: Votar em uma opção válida
- **WHEN** o cliente chama `POST /api/flash/shorts/:id/vote` com `optionId` de uma opção existente do short
- **THEN** a API responde 200 com o `poll` atualizado — `votes` da opção e `totalVotes` incrementados

**API Contract**

```http
POST /api/flash/shorts/:id/vote
Content-Type: application/json
```

```json
{
  "data": {
    "question": "Você vai assistir à final?",
    "options": [
      { "id": "opt-1", "label": "Sim", "votes": 35 },
      { "id": "opt-2", "label": "Não", "votes": 6 }
    ],
    "totalVotes": 41
  },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Após o voto, a UI exibe percentuais com barras e trava nova votação neste browser (`localStorage` — 1 voto por short).

### Requirement: Validação do voto
A API SHALL rejeitar voto inválido com `400` (`BAD_REQUEST`): `optionId` ausente, inexistente no short, ou short sem enquete. Short inexistente responde `404` (`NOT_FOUND`).

#### Scenario: Votar com opção inexistente
- **WHEN** o cliente chama `POST /api/flash/shorts/:id/vote` com `optionId` que não pertence à enquete do short
- **THEN** a API responde 400 com `{ "data": null, "error": { "code": "BAD_REQUEST", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }` e nenhum contador é alterado

**API Contract**

```http
POST /api/flash/shorts/:id/vote
Content-Type: application/json
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "Invalid poll option" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```
