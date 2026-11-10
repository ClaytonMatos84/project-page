## ADDED Requirements

### Requirement: Envelope de resposta único
Toda resposta da API SHALL usar um envelope único `{ data, meta }`, com `meta.latencyMs` (inteiro),
`meta.contract` e `meta.traceId` (correlação) preenchidos, e `data: null` em caso de erro.

#### Scenario: Resposta de sucesso com telemetria
- **WHEN** o cliente chama qualquer endpoint da API
- **THEN** o corpo SHALL conter `data` com o payload e `meta.latencyMs` (inteiro), `meta.contract` (`v1`) e `meta.traceId` preenchidos

**API Contract**

```http
GET /health
```

```json
{
  "data": { "status": "ok", "uptimeMs": 123456, "version": "v1" },
  "meta": { "latencyMs": 1, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b", "ts": "2026-11-10T12:00:00.000Z" }
}
```

**UI & Aesthetic Contract**

- Valores de `meta` (latências, timestamps, traceId) renderizados em **JetBrains Mono** (§5.3).
- Contraste AA no texto de telemetria em dark e light.

### Requirement: Correlação por traceId
A API SHALL incluir `meta.traceId` único por requisição em toda resposta, inclusive em erro.

#### Scenario: Correlacionar requisição por traceId
- **WHEN** o cliente chama qualquer endpoint da API
- **THEN** a resposta SHALL conter `meta.traceId` não vazio, permitindo correlacionar a requisição

**API Contract**

```http
GET /health
```

```json
{ "data": { "status": "ok", "uptimeMs": 123456, "version": "v1" }, "meta": { "latencyMs": 1, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Health check
A API SHALL expor `GET /health` retornando status, uptime e versão do contrato do serviço.

#### Scenario: Consultar integridade do serviço
- **WHEN** o cliente chama `GET /health`
- **THEN** a API responde 200 com `data.status = "ok"`, `data.uptimeMs`, `data.version` e `meta.latencyMs` presente

**API Contract**

```http
GET /health
```

```json
{ "data": { "status": "ok", "uptimeMs": 123456, "version": "v1" }, "meta": { "latencyMs": 1, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Contrato de erro padronizado
A API SHALL responder erros `400` (`BAD_REQUEST`), `404` (`NOT_FOUND`) e `500` (`INTERNAL`) no envelope
com `data: null`, `error.code`, `error.message` e `meta.latencyMs`/`meta.traceId` presentes mesmo em erro.

#### Scenario: Recurso inexistente
- **WHEN** o cliente chama um endpoint com um identificador que não existe
- **THEN** a API responde 404 com `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": { "latencyMs": ..., "traceId": "..." } }`

**API Contract**

```http
GET /api/portal/articles/:id
```

```json
{ "data": null, "error": { "code": "NOT_FOUND", "message": "Article not found" }, "meta": { "latencyMs": 3, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: CORS liberado em desenvolvimento
A API SHALL liberar CORS com `Access-Control-Allow-Origin: *` para permitir o consumo pelo frontend em `:3000`.

#### Scenario: Requisição cross-origin do frontend
- **WHEN** o frontend em `:3000` chama a API em `:3001`
- **THEN** a resposta SHALL incluir `Access-Control-Allow-Origin: *` e ser aceita pelo navegador

**API Contract**

```http
OPTIONS /api/portal/highlights
Origin: http://localhost:3000
```

```json
{ "data": null, "meta": { "latencyMs": 1, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```

### Requirement: Codificação UTF-8 das respostas
A API SHALL enviar `Content-Type: application/json; charset=utf-8` em todas as respostas.

#### Scenario: Resposta com acentuação
- **WHEN** a API devolve conteúdo com acentuação (pt-BR)
- **THEN** o header `Content-Type` SHALL ser `application/json; charset=utf-8` e os acentos preservados

**API Contract**

```http
GET /api/portal/editorias
```

```json
{ "data": [ { "id": "geral", "name": "Notícias", "slug": "noticias", "color": "#CB0003" } ], "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" } }
```
