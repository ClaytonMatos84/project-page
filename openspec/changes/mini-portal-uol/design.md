## Context

O Mini Portal UOL (§3.1) é construído **sobre** `uol-foundation`: envelope, erros, tokens e tipografia já
estão congelados. Esta change adiciona o contrato REST do portal, o seed em memória e as telas `Home`,
`Editoria` e `Leitura`, mais a camada de dados com polling. A verdade visual é a página uol.com.br (§1),
resumida em header mini enxuto (decisão do usuário).

## Goals / Non-Goals

**Goals**
- Home agregadora com destaques, navegação por editoria, leitura e busca simples.
- Contrato REST imutável e refletido 1:1 no frontend.
- Camada de dados que satisfaz §4.2 (fetch tipado, polling 3s com cleanup) sem duplicação de lógica.

**Non-Goals**
- Flash Short e Bate-Papo (fora do escopo desta change).
- Autenticação, persistência durável, SEO/SSR, internacionalização.
- Replicar todos os módulos da home real (Prime, Loterias, Ingresso, etc.) — apenas a versão mini.

## Decisions

- **Seed em memória derivado dos protótipos** (§2.1), carregado no boot da API; sem banco. Alternativa (SQLite) rejeitada por §2.1.
- **Busca como endpoint próprio** `GET /api/portal/search?q=` (decisão do usuário), em vez de filtro em `/articles`; **case-insensitive** sobre `title` e `summary`, permite ranking/estado próprios e `400` dedicado.
- **`Highlight` referencia `articleId` e inclui o `article` no payload** — evita N+1 no cliente. Alternativa (cliente resolve por `/articles/:id`) rejeitada por custo de round-trips.
- **Hook único `usePolling<T>()`** encapsula `setInterval` + cleanup + pausa em `document.hidden`, usado por `Home`. Alternativa (setInterval por componente) arrisca intervalos órfãos (§4.2).
- **React Router** para `Home` (`/`), `Editoria` (`/editoria/:slug`) e `Leitura` (`/leitura/:id`). Alternativa (estado interno) perde deep-link e a11y de navegação.
- **Header em versão mini**: logo + busca + faixa de editorias, omitindo barrauol/módulos comerciais.
- **Dark/light ativo na v1**, aplicado por tokens herdados de `uol-foundation`.

### Decisões v2 (alteração de layout, decisão do usuário)

- **Hero com ênfase máxima no topo** (§1, uol.com.br): imagem em largura total + manchete ampliada;
  "Últimas notícias" desce para abaixo do destaque.
- **Seção "Últimas notícias" em duas colunas**: cards de destaque à esquerda e, à direita, listagem
  numerada estilo "mais lidas" alimentada por `GET /api/portal/articles?limit=5` (sem endpoint novo —
  contrato REST permanece imutável).
- **Navigation estilo uol.com.br**: links de texto em negrito com divisores finos (não chips) + atalho
  "Flash" para `/flash` (produto do projeto). A faixa de chips de editoria duplicada na home foi
  removida — a navegação por editoria vive no header.

## Risks / Trade-offs

- [Seed divergir da forma dos protótipos] → Tipos em `shared/` como contrato único; QA valida contra o contrato, não contra o código.
- [Polling 3s multiplicado por telas] → Só `Home` faz polling; `Editoria`/`Leitura` são sob demanda.
- [`document.hidden` + `setInterval` complexos de testar] → Isolar no hook `usePolling` e cobrir por cenário TRACK-D.
- [Header mini perder identidade UOL] → Resolvido na v2: nav horizontal espelha o menu do uol.com.br.
- [Conflito §1: home real light vs dark obrigatório] → Dark ativo na v1; nota no relatório §9.

## Migration Plan

Sem migração (base inicial). Rollback: remover a change; `uol-foundation` permanece.

## Open Questions

- Nenhuma em aberto. Resolvidas: `/articles` usa **limite default 10**; busca **case-insensitive** (match em `title` + `summary`).
