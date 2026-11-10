## ADDED Requirements

### Requirement: Busca simples de conteúdo
A API SHALL expor busca simples **case-insensitive** por termo em endpoint próprio, retornando artigos que casam com o termo.

#### Scenario: Buscar por termo ignorando caixa
- **WHEN** o cliente chama `GET /api/portal/search?q=EconomIA`
- **THEN** a API responde 200 com envelope `{ data, meta }`, artigos que casam com o termo **ignorando maiúsculas/minúsculas** (mesma forma de `Article`) e `meta.latencyMs`/`meta.traceId` preenchidos

**API Contract**

```http
GET /api/portal/search?q=<termo>
```

```json
{
  "data": [ { "id": "art-3", "title": "Título", "summary": "...", "editoria": "economia", "publishedAt": "2026-11-10T08:00:00.000Z", "imageUrl": "https://.../c.jpg", "url": "/leitura/art-3" } ],
  "meta": { "latencyMs": 5, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Controle de busca no header mini; foco visível e navegável por teclado (§4.3).
- Resultado vazio usa estado dedicado com orientação (§4.3).

### Requirement: Requisição de busca inválida
A API SHALL responder `400` (`BAD_REQUEST`) quando o termo de busca estiver ausente ou vazio.

#### Scenario: Buscar sem termo
- **WHEN** o cliente chama `GET /api/portal/search` sem `q` (ou com `q` vazio)
- **THEN** a API responde 400 com `{ "data": null, "error": { "code": "BAD_REQUEST", "message": "..." }, "meta": { "latencyMs": ... } }`

**API Contract**

```http
GET /api/portal/search
```

```json
{ "data": null, "error": { "code": "BAD_REQUEST", "message": "Query param 'q' is required" }, "meta": { "latencyMs": 1, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

**UI & Aesthetic Contract**

- Erro de entrada exibido de forma não bloqueante; `role="alert"` para o erro crítico (§4.3).
