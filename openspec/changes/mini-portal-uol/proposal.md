## Why

O **Mini Portal UOL** (§3.1) é a porta de entrada do ecossistema: home agregadora com manchetes,
editorias e atalhos. Esta change entrega as três telas (`Home`, `Editoria`, `Leitura`), o contrato REST
e a camada de dados. Ela **depende** de `uol-foundation` (gate §8 Fase 1): envelope, erros, tokens e
tipografia vêm de lá; não são reespecificados aqui.

## What Changes

- API REST do portal em `:3001`, persistência em memória com seed derivado dos protótipos:
  - `GET /api/portal/highlights` — destaques da home.
  - `GET /api/portal/editorias` — lista de editorias.
  - `GET /api/portal/articles?editoria=<slug>&limit=<n>` — artigos por editoria.
  - `GET /api/portal/articles/:id` — detalhe do conteúdo (`404` se não existir).
  - `GET /api/portal/search?q=<termo>` — busca simples (**endpoint próprio**, decisão do usuário).
- Frontend React em `:3000`: telas `Home`, `Editoria`, `Leitura`, componente de busca e atalhos de editoria.
- **Camada de dados obrigatória** (§4.2): `apiFetch<T>()` tipado que desembrulha `data`, `ApiError` tipada,
  **polling de 3s com cleanup**, pausa em `document.hidden`.
- Estados `loading`/`erro`/`vazio` e acessibilidade AA (§4.3), header **em versão mini enxuta** (decisão do usuário).

## Capabilities

### New Capabilities
- `portal-highlights`: destaques da home (`GET /api/portal/highlights`) e o bloco de destaque principal.
- `portal-editorias`: lista de editorias (`GET /api/portal/editorias`) e a navegação por editoria.
- `portal-articles`: listagem por editoria e detalhe (`GET /api/portal/articles`, `/articles/:id`) + telas `Editoria`/`Leitura`.
- `portal-search`: busca simples (`GET /api/portal/search?q=`) e o controle de busca no header mini.
- `portal-frontend-core`: camada de dados tipada, polling 3s com cleanup, estados de UI e a11y.

### Modified Capabilities
<!-- Nenhuma: uol-foundation é base nova; openspec/specs/ ainda está vazio. -->

## Impact

- **Track B (`backend/`, :3001):** rotas do portal + seed em memória; reusa envelope/erros de `uol-foundation`.
- **Track C (`frontend/src/`, :3000):** telas, data layer, busca, estados, a11y; consome tokens de `uol-foundation`.
- **`shared/`:** tipos `Article`, `Editoria`, `Highlight` (somente leitura para B/C).
- **Track D (`qa/`):** cenários contra o contrato (listagem + polling 3s com cleanup; busca; 404).
- Relacionamento: **depende de** `uol-foundation`.
