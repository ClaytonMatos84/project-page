## Why

O **UOL Flash Short** (§3.2) é o formato curto e rápido de notícias da sprint: cards objetivos,
leitura em segundos. Esta change entrega o feed vertical estilo TikTok (moldura de smartphone,
scroll com snap), reação curta, enquete interativa e publicação de novos shorts. Ela **depende**
de `uol-foundation` (gate §8 Fase 1): envelope, erros, tokens e tipografia vêm de lá; não são
re-especificados aqui.

## What Changes

- API REST do flash em `:3001`, persistência em memória com seed derivado dos protótipos
  (6 shorts do universo UOL com mídia vertical, enquete e link da matéria):
  - `GET /api/flash/shorts?sort=recent|popular&limit=<n>` — feed ordenado por recência ou popularidade.
  - `GET /api/flash/shorts/:id` — detalhe do short (`404` se não existir).
  - `POST /api/flash/shorts` — publicar novo short (`400` em validação, `201` em sucesso).
  - `POST /api/flash/shorts/:id/reactions` — incrementa reação/curtida (`404` se não existir).
  - `POST /api/flash/shorts/:id/vote` — vota na enquete do short (`400`/`404`).
- **Extensão da entidade `Short`** (contrato Track A; nenhum endpoint a consumia ainda):
  `mediaUrl`, `mediaType` (`image`|`video`), `articleUrl` e `poll?` embutido (evita N+1,
  mesmo padrão de `HighlightWithArticle`). Nova entidade `Poll` (`question`, `options`, `totalVotes`).
- Frontend React em `:3000`: rota imersiva `/flash` (fora do `Layout` do portal) com moldura de
  smartphone, feed `snap-y snap-mandatory`, rail de ações flutuante (Curtir, Ler Matéria Completa
  em bottom sheet, Compartilhar, Publicar), enquete sobre a mídia e toggle **Recentes / Mais
  curtidos** — que materializa a tela `Curtidas` (reação/ranking) do §3.2.
- **Camada de dados obrigatória** (§4.2): reuso de `apiFetch<T>()` e `usePolling` (polling de 3s
  com cleanup, pausa em `document.hidden`); contadores atualizados in-place com `key` estável.
- Dedup de curtida/voto **sem autenticação**: contrato apenas incrementa; o frontend guarda
  `localStorage` (1 curtida + 1 voto por short por browser) — decisão registrada no design.
- Estados `loading`/`erro`/`vazio` e acessibilidade AA (§4.3): navegação por teclado no feed
  (setas/botões prev-next), focus trap no bottom sheet e no modal, `aria-live="polite"` apenas
  na região de contadores do card visível.

## Capabilities

### New Capabilities
- `flash-shorts`: feed (`GET /api/flash/shorts` com `sort`/`limit`), detalhe (`GET /:id`) e
  publicação (`POST /api/flash/shorts` com validação `400`).
- `flash-reactions`: reação curta (`POST /api/flash/shorts/:id/reactions`) e contagem exibida.
- `flash-polls`: entidade `Poll` embutida no short e voto (`POST /api/flash/shorts/:id/vote`).
- `flash-frontend-core`: rota `/flash` imersiva, moldura de smartphone, feed snap vertical,
  rail de ações, bottom sheet de matéria, modal de publicação, polling 3s com cleanup, a11y.

### Modified Capabilities
<!-- Nenhuma: uol-foundation (api-convention, design-tokens) permanece intocada; a extensão de
     `Short` acontece porque nenhum endpoint o consumia — não é modificação de requisito existente. -->

## Impact

- **Track B (`backend/`, :3001):** nova rota `routes/flash.ts` + seed de 6 shorts (mídia vertical
  via picsum `720/1280`, precedente do seed do portal); reusa envelope/erros/telemetria da fundação.
- **Track C (`frontend/src/`, :3000):** rota `/flash`, componentes do feed/rail/sheet/modal;
  reusa `apiFetch`, `usePolling`, `tokens.css`, `ThemeToggle`.
- **`shared/`:** estende `Short` (+4 campos) e adiciona `Poll`/`PollOption` (somente leitura para B/C).
- **Track D (`qa/`):** cenários contra o contrato (feed + polling 3s com cleanup; reação; voto;
  publicação 400/201; 404; contraste AA no amarelo).
- Relacionamento: **depende de** `uol-foundation`.
