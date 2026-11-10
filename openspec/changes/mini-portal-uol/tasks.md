## 1. Contrato e shared

- [x] 1.1 [PARALLEL TRACK-A] Validar `openspec validate mini-portal-uol --strict` sem avisos.
- [x] 1.2 [PARALLEL TRACK-A] Publicar tipos `Article`, `Editoria`, `Highlight` em `shared/` (somente leitura para B/C).

## 2. Backend / API

- [x] 2.1 [PARALLEL TRACK-B] Seed em memória (artigos, editorias, destaques) derivado dos protótipos.
- [x] 2.2 [PARALLEL TRACK-B] `GET /api/portal/highlights` com destaque + `article` embutido.
- [x] 2.3 [PARALLEL TRACK-B] `GET /api/portal/editorias`.
- [x] 2.4 [PARALLEL TRACK-B] `GET /api/portal/articles?editoria=&limit=` com limite default **10**.
- [x] 2.5 [PARALLEL TRACK-B] `GET /api/portal/articles/:id` com `404` quando inexistente.
- [x] 2.6 [PARALLEL TRACK-B] `GET /api/portal/search?q=` **case-insensitive** (title+summary) com `400` quando `q` ausente/vazio.

## 3. Frontend / UI

- [x] 3.1 [PARALLEL TRACK-C] Camada de dados: `apiFetch<T>()`, `ApiError` e hook `usePolling` (3s + cleanup + pausa em `document.hidden`).
- [x] 3.2 [PARALLEL TRACK-C] Rotas `Home` (`/`), `Editoria` (`/editoria/:slug`), `Leitura` (`/leitura/:id`).
- [x] 3.3 [PARALLEL TRACK-C] Header mini (logo + busca + chips de editoria) e rodapé de créditos.
- [x] 3.4 [PARALLEL TRACK-C] Tela `Home`: destaque principal + destaques com polling e `aria-live="polite"`.
- [x] 3.5 [PARALLEL TRACK-C] Tela `Editoria`: lista de artigos com estados `loading`/`erro`/`vazio`.
- [x] 3.6 [PARALLEL TRACK-C] Tela `Leitura`: detalhe + tratamento de `404`.
- [x] 3.7 [PARALLEL TRACK-C] Busca simples com estado vazio dedicado e `role="alert"` no erro.

## 4. QA / Demo

- [x] 4.1 [PARALLEL TRACK-D] Cenário: `GET /api/portal/highlights` + polling de 3s com cleanup.
- [x] 4.2 [PARALLEL TRACK-D] Cenário: listagem por editoria + estados `loading`/`erro`/`vazio`.
- [x] 4.3 [PARALLEL TRACK-D] Cenário: detalhe `404` no formato padrão.
- [x] 4.4 [PARALLEL TRACK-D] Cenário: busca com resultado, vazio e `400` sem termo.
- [x] 4.5 [PARALLEL TRACK-D] Cenário: acessibilidade AA + `aria-live` em dark e light.

## 5. Alterações de layout da home e do navigation (v2)

- [x] 5.1 [PARALLEL TRACK-A] Atualizar specs: hero com ênfase no topo, seção "Últimas notícias" em duas colunas com lista estilo "mais lidas", navigation horizontal estilo uol.com.br com atalho "Flash".
- [x] 5.2 [PARALLEL TRACK-C] Navigation do header estilo uol.com.br: links de texto com divisores finos + atalho "Flash" para `/flash`.
- [x] 5.3 [PARALLEL TRACK-C] Hero do destaque principal com mais ênfase (imagem larga + manchete ampliada) no topo da home.
- [x] 5.4 [PARALLEL TRACK-C] Seção "Últimas notícias" abaixo do destaque: cards à esquerda + lista numerada estilo "mais lidas" (`GET /api/portal/articles?limit=5`) à direita.
- [x] 5.5 [PARALLEL TRACK-D] Revalidar cenários de home (polling + `aria-live`) e navegação após o novo layout.
