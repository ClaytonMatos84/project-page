## Why

A sprint UOL (§8) obriga um **contrato cross-cutting congelado antes de qualquer código de produto**.
Esta change é o *gate* da Fase 1: fixa o envelope de resposta, a telemetria, o formato de erro e os
tokens do Design System que todo o `mini-portal-uol` (e futuros produtos) vão consumir. Sem ela, cada
track inventaria seu próprio formato — o que o AGENTS.md §1/§2/§4/§5 proíbe.

## What Changes

- Introduz a **convenção de API** único do sistema: envelope `{ data, meta }`, telemetria
  (`latencyMs`, `contract`, `ts`), CORS liberado, `Content-Type: application/json; charset=utf-8`,
  `GET /health` e o formato padronizado de erro `400/404/500` com `data: null`.
- Introduz os **tokens do Design System UOL** (§5): paleta de marca, cores por editoria, tipografia
  (Inter + JetBrains Mono), superfícies dark/light, micro-interações e créditos anti-AI-slop.
- Cria `shared/` como local **somente leitura** dos tipos do contrato para as tracks B/C.
- **BREAKING** se já houvesse endpoints existentes sem envelope — não há; é a base inicial.

## Capabilities

### New Capabilities
- `api-convention`: envelope de resposta + telemetria, contrato de erro, `/health`, CORS e charset.
- `design-tokens`: paleta/editorias/tipografia/temas/micro-interações e créditos do Design System UOL.

### Modified Capabilities
<!-- Nenhuma: openspec/specs/ está vazio; todos os requisitos são novos. -->

## Impact

- **Track B (`backend/`, :3001):** middleware de envelope, telemetria de latência, handler de erros, `/health`, CORS.
- **Track C (`frontend/src/`, :3000):** consumo dos tokens em `tailwind`/CSS vars; `apiFetch<T>()` depende do envelope.
- **`shared/`:** tipos do contrato (envelope + entidades) somente leitura para B/C.
- **`openspec/`:** base do contrato que o `mini-portal-uol` estende. Nenhum endpoint de produto aqui.
- Relacionamento: `mini-portal-uol` **depende** desta change (gate §8 Fase 1).
