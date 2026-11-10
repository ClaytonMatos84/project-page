## Context

Sprint UOL com fundação congelada (`uol-foundation`: envelope `{ data, meta }` com `traceId`
obrigatório, erros 400/404/500 padronizados, 5 editorias canônicas, tokens de design) e
`mini-portal-uol` completo. A camada de dados do frontend (`apiFetch<T>`, `ApiError`,
`usePolling` com cleanup e pausa por `document.hidden`) já existe e é reusável. A entidade
`Short` em `shared/` é um skeleton (nenhum endpoint a consumia) — esta change é a spec Track A
que a define por completo. Produto: §3.2 do AGENTS.md (formato curto, leitura em segundos),
com feed vertical estilo TikTok decidido em exploração com o usuário.

## Goals / Non-Goals

**Goals:**
- Contrato REST imutável do flash: feed (`sort=recent|popular`), detalhe, publicação, reação, voto.
- Feed imersivo em `/flash`: moldura de smartphone 9:16, `snap-y snap-mandatory`, rail de ações,
  bottom sheet de matéria, modal de publicação, enquete sobre a mídia.
- Materializar a tela `Curtidas` (reação/ranking) do §3.2 como toggle **Recentes / Mais curtidos**.
- Reuso máximo da fundação: envelope, erros, telemetria, tokens, `apiFetch`, `usePolling`.

**Non-Goals:**
- Autenticação/identidade de usuário (dedup é por browser, ver Decisões).
- Upload de mídia (o publish aceita apenas URL de mídia já hospedada).
- TTS/áudio do resumo (decisão da exploração: "resumo falado" = texto do `body` sobre a mídia).
- WebSocket/SSE (atualização é polling de 3s, §4.2).
- Persistência além de memória (§2.1 — seed repovoado no boot).

## Decisions

1. **Rotas sob `/api/flash/` com `reactions`** — precedência §1: AGENTS.md §3.2 (`GET /api/flash/shorts`,
   `POST /:id/reactions`) vence o sketch original (`/api/shorts`, `/:id/like`). O copy da UI continua
   "Curtir"; o termo do contrato é `reactions`. Alternativa descartada: seguir o sketch (viola §3.2).
2. **Estender `Short` em vez de criar entidade paralela** — `shared/` exige nova spec Track A para
   mudar tipos; nenhum endpoint consumia `Short`, logo a extensão (+`mediaUrl`, `mediaType`,
   `articleUrl`, `poll?`) é não-quebra. Alternativa descartada: `ShortWithMedia` paralelo (duplicação).
3. **`poll` embutido no `Short`** — evita N+1 no feed, mesmo padrão de `HighlightWithArticle`.
   Alternativa descartada: `GET /shorts/:id/poll` separado (uma chamada extra por card).
4. **Resumo = texto do `body` sobre a mídia** — decisão do usuário na exploração. Alternativas
   descartadas: TTS via Web Speech API (escopo) e `audioUrl` gravado (assets pesados).
5. **Ranking = toggle `sort=recent|popular` no feed** — satisfaz a tela `Curtidas` do §3.2 mantendo
   a imersão TikTok. Alternativa descartada: view dedicada de ranking (quebra a imersão).
6. **Dedup por `localStorage`, contrato incrementa puro** — sem auth no sistema; o frontend guarda
   1 curtida + 1 voto por short por browser e desabilita a ação. `POST /reactions` e `POST /vote`
   apenas incrementam. Alternativa descartada: rastrear `clientId` no backend (complexidade e mudança
   de contrato para uma demo sem identidade).
7. **Mídia do seed = picsum vertical `720/1280`** — precedente do seed do portal (`800/450`):
   URLs remotas, backend JSON puro. O contrato suporta `mediaType: 'video'`, mas o seed só exercita
   `image` (vídeo entra via publish manual). Alternativa descartada: assets locais (incha `backend/`
   com binários e não elimina dependência de rede das imagens do portal).
8. **`POST /api/flash/shorts` responde `201`** com o short criado; validação falha → `400`
   (`BAD_REQUEST`). Regras: `title` 1–120, `body` 1–500, `editoria` ∈ 5 slugs canônicos, `mediaUrl`
   http(s), `mediaType` ∈ `image|video`, `articleUrl` http(s) opcional, `poll` opcional
   (`question` 1–120 + 2–4 opções não vazias; servidor atribui ids e `votes: 0`).
   `durationMs` derivado pelo servidor a partir do `body` (tempo de leitura estimado).
9. **Voto em short sem enquete → `400`** (o recurso existe, mas a requisição não se aplica a ele);
   `optionId` ausente/inexistente → `400`; short inexistente → `404`.
10. **Snap × polling: contadores in-place** — `key={short.id}` estável; o polling de 3s atualiza
    contadores sem remontar cards nem perder o snap. Reordenação acontece **apenas** quando o
    usuário alterna o toggle (em `popular`, o polling não reordena sozinho — senão o card muda
    sob o dedo do usuário).
11. **A11y do feed TikTok** — navegação por teclado (setas ↑/↓ e/ou botões prev/next); focus trap +
    `Esc` + retorno de foco no bottom sheet e no modal; `aria-live="polite"` **apenas** na região de
    contadores do card visível (nunca no feed inteiro); vídeo (quando houver) `muted` + `playsInline`
    + pausa via IntersectionObserver fora da viewport; `prefers-reduced-motion` respeitado.
12. **Rota `/flash` fora do `Layout` do portal** — experiência imersiva, sem header do portal;
    atalho discreto de retorno ao portal. A CRITÉRIO, registrado aqui.

## Risks / Trade-offs

- [Picsum remoto indisponível na demo] → `onError` da mídia renderiza superfície de fallback com a
  cor da editoria (nunca tela branca); o card permanece legível (título/resumo independem da mídia).
- [Reordenação em `popular` muda o card sob o dedo] → reordenação só via toggle; polling atualiza
  in-place (Decisão 10).
- [`localStorage` é por browser, não é segurança] → aceito para demo; contrato permanece incremento
  puro; documentado aqui e no relatório (§9).
- [Publish sem auth permite spam] → aceito para demo; validação de forma (`400`) apenas.
- [Vídeo com autoplay prejudica a11y/banda] → `muted`, `playsInline`, pausa off-screen,
  `prefers-reduced-motion`; seed usa apenas imagens.
- [Memória perdida no restart da API] → by design (§2.1); seed repovoado no boot; curtidas/votos
  de sessões anteriores não persistem.

## Migration Plan

Aditivo e reversível: nova rota `routes/flash.ts` no Express e nova rota `/flash` no React.
Nada do portal é tocado; `shared/` só ganha campos (não-quebra). Rollback = remover as rotas novas.

## Open Questions

Nenhuma bloqueante. Decisões menores fechadas como A CRITÉRIO: `201` no publish (Decisão 8),
`poll` opcional na publicação, `articleUrl` opcional (botão "Ler Matéria Completa" condicional à
existência do campo).
