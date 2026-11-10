# portal-articles

## Purpose
Define article listing and detail behavior for the UOL Mini Portal.

## Requirements

### Requirement: Listagem de artigos por editoria
A API SHALL listar artigos filtráveis por editoria e limitáveis (`limit`, **default 10**), para a tela `Editoria`.

#### Scenario: Listar artigos de uma editoria
- **WHEN** o cliente chama `GET /api/portal/articles?editoria=esportes&limit=20`
- **THEN** a API responde 200 com envelope `{ data, meta }`, cada artigo com `id`, `title`, `summary`, `editoria`, `publishedAt`, `imageUrl` e `url`, e `meta.latencyMs` preenchido

**API Contract**

```http
GET /api/portal/articles?editoria=esportes&limit=20
```

```json
{
  "data": [
    { "id": "art-9", "title": "Título", "summary": "...", "editoria": "esportes", "publishedAt": "2026-11-10T09:00:00.000Z", "imageUrl": "https://.../b.jpg", "url": "/leitura/art-9" }
  ],
  "meta": { "latencyMs": 4, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Lista com hierarquia clara (não cards idênticos empilhados); `publishedAt` em JetBrains Mono.
- Estados `loading`/`erro`/`vazio` obrigatórios (§4.3).

### Requirement: Limite default da listagem
A API SHALL aplicar limite default de `10` quando `limit` não for informado em `GET /api/portal/articles`.

#### Scenario: Listar sem informar limite
- **WHEN** o cliente chama `GET /api/portal/articles?editoria=esportes` sem o parâmetro `limit`
- **THEN** a API SHALL retornar no máximo 10 artigos

**API Contract**

```http
GET /api/portal/articles?editoria=esportes
```

```json
{ "data": [ /* até 10 artigos */ ], "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Detalhe do artigo
A API SHALL expor o detalhe de um artigo por `id`, respondendo `404` quando não existir, para a tela `Leitura`.

#### Scenario: Consultar detalhe inexistente
- **WHEN** o cliente chama `GET /api/portal/articles/:id` com um `id` que não existe
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
GET /api/portal/articles/:id
```

```json
{
  "data": { "id": "art-1", "title": "Título", "summary": "...", "editoria": "economia", "publishedAt": "2026-11-10T09:00:00.000Z", "imageUrl": "https://.../a.jpg", "url": "/leitura/art-1" },
  "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Tela `Leitura` com editoria na cor do token, `publishedAt` em JetBrains Mono e foco visível.
- Erro com mensagem clara + ação "tentar novamente" (§4.3).
