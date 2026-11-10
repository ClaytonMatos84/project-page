## ADDED Requirements

### Requirement: Feed de shorts
A API SHALL listar shorts ordenáveis por `sort=recent` (default, por `createdAt` desc) ou
`sort=popular` (por `reactions` desc) e limitáveis (`limit`, **default 20**), cada short com
`id`, `title`, `body`, `durationMs`, `editoria`, `reactions`, `createdAt`, `mediaUrl`,
`mediaType`, `articleUrl` e `poll?` embutido.

#### Scenario: Listar feed por recência
- **WHEN** o cliente chama `GET /api/flash/shorts?sort=recent&limit=20`
- **THEN** a API responde 200 com envelope `{ data, meta }`, cada short com os campos do contrato e `meta.latencyMs` preenchido

**API Contract**

```http
GET /api/flash/shorts?sort=recent&limit=20
```

```json
{
  "data": [
    {
      "id": "short-1",
      "title": "Título do short",
      "body": "Resumo curto e objetivo, leitura em segundos.",
      "durationMs": 20000,
      "editoria": "esportes",
      "reactions": 128,
      "createdAt": "2026-11-10T09:00:00.000Z",
      "mediaUrl": "https://picsum.photos/seed/uol-short-1/720/1280",
      "mediaType": "image",
      "articleUrl": "https://uol.com.br/esportes/materia-exemplo",
      "poll": {
        "question": "Você acompanhou o jogo?",
        "options": [
          { "id": "opt-1", "label": "Sim, do início ao fim", "votes": 12 },
          { "id": "opt-2", "label": "Só o segundo tempo", "votes": 8 }
        ],
        "totalVotes": 20
      }
    }
  ],
  "meta": { "latencyMs": 4, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Feed vertical imersivo (moldura de smartphone, snap obrigatório); chip de editoria na cor do token (§5.2).
- `durationMs` exibido como badge de tempo de leitura em JetBrains Mono.

### Requirement: Ordenação por popularidade
A API SHALL ordenar o feed por popularidade (`sort=popular`) quando informado, ranqueando por `reactions` desc.

#### Scenario: Listar mais curtidos
- **WHEN** o cliente chama `GET /api/flash/shorts?sort=popular`
- **THEN** a API responde 200 com os shorts ordenados por `reactions` em ordem decrescente

**API Contract**

```http
GET /api/flash/shorts?sort=popular
```

```json
{ "data": [ /* shorts por reactions desc */ ], "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

**UI & Aesthetic Contract**

- Toggle **Recentes / Mais curtidos** no topo do feed materializa a tela `Curtidas` (§3.2).

### Requirement: Detalhe do short
A API SHALL expor o detalhe de um short por `id`, respondendo `404` quando não existir.

#### Scenario: Consultar detalhe inexistente
- **WHEN** o cliente chama `GET /api/flash/shorts/:id` com um `id` que não existe
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
GET /api/flash/shorts/:id
```

```json
{
  "data": { "id": "short-1", "title": "Título do short", "body": "...", "durationMs": 20000, "editoria": "esportes", "reactions": 128, "createdAt": "2026-11-10T09:00:00.000Z", "mediaUrl": "https://.../720/1280", "mediaType": "image", "articleUrl": "https://uol.com.br/...", "poll": { "question": "...", "options": [], "totalVotes": 20 } },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

### Requirement: Publicação de novo short
A API SHALL publicar um novo short via `POST /api/flash/shorts`, validando o payload e respondendo
`201` com o short criado (incluindo `id`, `createdAt`, `reactions: 0` e `durationMs` derivado do `body`).

#### Scenario: Publicar short válido
- **WHEN** o cliente envia `POST /api/flash/shorts` com `title`, `body`, `editoria` válida, `mediaUrl` http(s) e `mediaType`
- **THEN** a API responde 201 com o short criado no `data` do envelope, visível no feed `sort=recent`

**API Contract**

```http
POST /api/flash/shorts
Content-Type: application/json
```

```json
{
  "data": {
    "id": "short-7",
    "title": "Título do novo short",
    "body": "Resumo curto do novo short.",
    "durationMs": 8000,
    "editoria": "tecnologia",
    "reactions": 0,
    "createdAt": "2026-11-10T12:00:00.000Z",
    "mediaUrl": "https://picsum.photos/seed/uol-short-7/720/1280",
    "mediaType": "image",
    "articleUrl": "https://uol.com.br/tecnologia/materia-exemplo"
  },
  "meta": { "latencyMs": 5, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

### Requirement: Validação da publicação
A API SHALL rejeitar publicação com payload inválido respondendo `400` (`BAD_REQUEST`): `title`
1–120 chars, `body` 1–500 chars, `editoria` em um dos 5 slugs canônicos, `mediaUrl` http(s),
`mediaType` em `image|video`, `articleUrl` http(s) opcional, `poll` opcional com `question` 1–120
e 2–4 opções não vazias.

#### Scenario: Publicar short com editoria inválida
- **WHEN** o cliente envia `POST /api/flash/shorts` com `editoria` fora dos 5 slugs canônicos
- **THEN** a API responde 400 com `{ "data": null, "error": { "code": "BAD_REQUEST", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }` e o feed permanece inalterado

**API Contract**

```http
POST /api/flash/shorts
Content-Type: application/json
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "editoria must be one of the canonical slugs" }, "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

**UI & Aesthetic Contract**

- Modal de publicação exibe o erro do contrato com mensagem clara, sem engolir a falha (§2.3).
