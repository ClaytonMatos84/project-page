# AGENTS.md — Guia Normativo da Sprint UOL (Frontend + Backend)

Este documento é a **norma operacional** da sprint curta dos times de Frontend e Backend da UOL.
Ele é **autossuficiente**: define precedência, regras, produtos, contratos, design, agentes, cronograma
e critérios de aceite. Nenhuma regra aqui depende de leitura externa.

Duas ferramentas estruturam a sprint:

- **OpenSpec** — fonte de verdade do contrato funcional (specs versionadas, validadas e rastreáveis).
- **OpenCode** — orquestração dos agentes que escrevem código a partir das specs.

Legenda de obrigatoriedade usada em todo o documento:

| Marca | Significado |
| --- | --- |
| **OBRIGATÓRIO** | Regra fixa. Desvio só com aprovação do `@orchestrator`. |
| **RECOMENDADO** | Padrão esperado; adaptação permitida com justificativa no relatório. |
| **A CRITÉRIO** | Espaço de decisão local (design/dev). Documente a escolha. |

---

## 1. Precedência e Resolução de Conflitos

A ordem abaixo é **normativa**. Em qualquer divergência, o item de maior precedência ganha,
sem exceção e sem negociação ad-hoc.

| Ordem | Fonte | Escopo | Observação |
| --- | --- | --- | --- |
| 1º | **Página UOL (https://uol.com.br)** | Verdade visual e funcional | Fonte final de layout, conteúdo, tom e comportamento (`uol-mini`). |
| 2º | **Este `AGENTS.md`** | Verdade de engenharia e processo | Vence contrato, código e opinião de agente. |
| 3º | **Spec OpenSpec aprovada** | Contrato imutável da API e dos requisitos | Derivada do item 1; não pode contradizê-lo. |
| 4º | **Código existente** | Implementação | Ajustado para refletir os itens acima. |
| 5º | **Preferência do agente** | Conveniência | Sem valor normativo. |

Regras de conflito:

- **OBRIGATÓRIO** — Conflito *visual/funcional* contra a página UOL: prevalece a **página**.
- **OBRIGATÓRIO** — Conflito *de processo, contrato ou convenção*: prevalece **este documento**.
- **OBRIGATÓRIO** — Conflito entre spec e página: a página vence e a spec **deve** ser corrigida antes de implementar.
- **OBRIGATÓRIO** — Todo conflito resolvido gera **nota no relatório** (§9), com a decisão e o impacto.
- **A CRITÉRIO** — Detalhes não cobertos por nenhuma fonte: decide o dono da track e registra no relatório.

> O Tailwind é a **expressão técnica da identidade UOL**. Não é uma fonte de verdade por si: ele
> materializa o que a página define. Tokens do Design System (§5) são a ponte entre página e código.

---

## 2. Regras Globais e Protocolo de Paralelismo

### 2.1 Sistema em duas portas

| Porta | Serviço | Papel | Persistência |
| --- | --- | --- | --- |
| `:3000` | Frontend React | UI, roteamento, data layer, polling | — (consome API) |
| `:3001` | API REST Node/Express | Contrato imutável, seed, CORS | **Em memória** (seed extraído dos protótipos) |

Regras de sistema:

- **OBRIGATÓRIO** — Frontend consome a API por `:3001`; nenhum dado é hardcoded na UI além de fallback de erro/vazio.
- **OBRIGATÓRIO** — Contrato REST é **imutável** após aprovação do `@spec-architect`. Mudança exige nova spec e re-aprovação.
- **OBRIGATÓRIO** — Persistência é **em memória**, populada por seed derivado dos protótipos; sem banco externo.
- **OBRIGATÓRIO** — CORS **liberado** na API de desenvolvimento.
- **OBRIGATÓRIO** — `Content-Type: application/json; charset=utf-8` em todas as respostas.

### 2.2 Tracks, diretórios e dono exclusivo

Cada track tem **dono exclusivo** e **diretório isolado**. Um agente **nunca** edita arquivos de outra track.

| Track | Diretório | Porta | Dono | Escopo |
| --- | --- | --- | --- | --- |
| **A — Contrato** | `openspec/` | — | `@spec-architect` | Specs, contrato, validação `--strict` |
| **B — Backend/API** | `backend/` | `:3001` | `@backend-dev` | Rotas, seed, telemetria, CORS |
| **C — Frontend/UI** | `frontend/src/` | `:3000` | `@frontend-dev` + `@ui-art-director` | Componentes, data layer, design system |
| **D — QA/Demo** | `qa/` | `:3000`/`:3001` | `@qa-demo` | Cenários, evidências, demo |

Protocolo de paralelismo:

- **OBRIGATÓRIO** — **Uma track = um dono = um diretório.** Conflito de dono é BLOCKER.
- **OBRIGATÓRIO** — Paralelismo só depois do contrato (Track A) congelado e validado.
- **OBRIGATÓRIO** — Tracks B, C e D rodam em paralelo; D inicia cenários a partir do contrato, não do código.
- **OBRIGATÓRIO** — Comunicação entre tracks é **via contrato**, nunca via import direto de código alheio.
- **OBRIGATÓRIO** — Auditoria ocorre **na convergência** (fim das tracks), antes do fechamento.
- **RECOMENDADO** — Commits pequenos e frequentes, prefixados com a track (`tracks(B): ...`).

### 2.3 Convenções de código (globais)

- **OBRIGATÓRIO** — TypeScript em frontend e backend; tipos do contrato em `shared/` **somente leitura** para B/C.
- **OBRIGATÓRIO** — Sem `any` implícito; erros tratados, nunca engolidos silenciosamente.
- **RECOMENDADO** — Nomeação em inglês no código; copy visível ao usuário em pt-BR.
- **OBRIGATÓRIO** — Sem segredo/credencial em código ou commit.

---

## 3. Especificações dos Produtos

Três produtos compõem a sprint. Cada um tem propósito, telas, funcionalidades, entidades e endpoints.
Os endpoints abaixo são **exemplos representativos**; a lista exaustiva vive na spec de cada produto (Track A).

### 3.1 Mini Portal UOL

| Campo | Definição |
| --- | --- |
| **Propósito** | Home agregadora com manchetes, editorias e atalhos — porta de entrada do ecossistema. |
| **Telas principais** | `Home` (feed de destaques), `Editoria` (lista por seção), `Leitura` (detalhe do conteúdo). |
| **Funcionalidades centrais** | Feed de manchetes, navegação por editoria, busca simples, destaque principal, atualização automática. |

Entidades:

| Entidade | Campos principais |
| --- | --- |
| `Article` | `id`, `title`, `summary`, `editoria`, `publishedAt`, `imageUrl`, `url` |
| `Editoria` | `id`, `name`, `slug`, `color` |
| `Highlight` | `articleId`, `position`, `label` |

Endpoints (exemplos):

```http
GET /api/portal/highlights        # destaques da home
GET /api/portal/editorias         # lista de editorias
GET /api/portal/articles?editoria=esportes&limit=20
GET /api/portal/articles/:id      # detalhe do conteúdo
```

### 3.2 UOL Flash Short

| Campo | Definição |
| --- | --- |
| **Propósito** | Formato curto e rápido de notícias — cards objetivos, leitura em segundos. |
| **Telas principais** | `Feed Short` (cards verticais), `Short` (detalhe curto), `Curtidas` (reação/ranking). |
| **Funcionalidades centrais** | Feed de shorts, reação curta (like), contagem de reações, ordenação por recência/popularidade. |

Entidades:

| Entidade | Campos principais |
| --- | --- |
| `Short` | `id`, `title`, `body`, `durationMs`, `editoria`, `reactions`, `createdAt` |
| `Reaction` | `shortId`, `count`, `updatedAt` |

Endpoints (exemplos):

```http
GET  /api/flash/shorts?sort=recent&limit=20
GET  /api/flash/shorts/:id
POST /api/flash/shorts/:id/reactions     # incrementa reação
```

### 3.3 Bate-Papo UOL Next-Gen

| Campo | Definição |
| --- | --- |
| **Propósito** | Salas de conversa em tempo quase real, com presença e moderação leve. |
| **Telas principais** | `Salas` (lista), `Sala` (chat ao vivo), `Entrada` (apelido/sala). |
| **Funcionalidades centrais** | Listar salas, entrar em sala, enviar/receber mensagens, contagem de online, polling de atualização. |

Entidades:

| Entidade | Campos principais |
| --- | --- |
| `Room` | `id`, `name`, `topic`, `online`, `createdAt` |
| `Message` | `id`, `roomId`, `author`, `text`, `createdAt` |
| `Presence` | `roomId`, `online`, `updatedAt` |

Endpoints (exemplos):

```http
GET  /api/chat/rooms
GET  /api/chat/rooms/:id
GET  /api/chat/rooms/:id/messages?since=<iso>
POST /api/chat/rooms/:id/messages        # { author, text }
```

---

## 4. Realização Backend & Frontend

### 4.1 Convenções de API

Toda resposta usa **envelope único** com telemetria. **OBRIGATÓRIO** em todos os endpoints.

```json
{
  "data": {},
  "meta": {
    "latencyMs": 42,
    "contract": "v1",
    "ts": "2026-11-10T12:00:00.000Z"
  }
}
```

| Elemento | Regra | Obrigação |
| --- | --- | --- |
| `data` | Payload. Em erro, `null`. | **OBRIGATÓRIO** |
| `meta.latencyMs` | Latência do handler em ms (inteiro). | **OBRIGATÓRIO** |
| `meta.contract` | Versão do contrato (ex.: `v1`). | **OBRIGATÓRIO** |
| `meta.ts` | Timestamp ISO 8601. | **RECOMENDADO** |

Health:

```http
GET /health
```

```json
{ "data": { "status": "ok", "uptimeMs": 123456, "version": "v1" }, "meta": { "latencyMs": 1, "contract": "v1" } }
```

Erros — **OBRIGATÓRIO** usar o envelope com `data: null`:

| Status | Uso | Corpo |
| --- | --- | --- |
| `400` | Requisição inválida | `{ "data": null, "error": { "code": "BAD_REQUEST", "message": "..." }, "meta": {...} }` |
| `404` | Recurso inexistente | `{ "data": null, "error": { "code": "NOT_FOUND", "message": "..." }, "meta": {...} }` |
| `500` | Erro interno | `{ "data": null, "error": { "code": "INTERNAL", "message": "..." }, "meta": {...} }` |

Regras de API:

- **OBRIGATÓRIO** — CORS liberado (`Access-Control-Allow-Origin: *`) em desenvolvimento.
- **OBRIGATÓRIO** — `latencyMs` presente mesmo em erro.
- **RECOMENDADO** — Paginação por `limit`/`offset`; filtros por query string.
- **A CRITÉRIO** — `traceId` opcional em `meta` para correlação.

### 4.2 Camada de dados (frontend)

- **OBRIGATÓRIO** — **Fetch tipado**: um wrapper `apiFetch<T>()` que tipa a resposta pelo contrato e **desembrulha** `data`.
- **OBRIGATÓRIO** — Erros do wrapper viram exceção tipada (`ApiError` com `status`/`code`), nunca `throw` de string.
- **OBRIGATÓRIO** — **Polling de 3s** com **cleanup**: `setInterval` + `clearInterval` no unmount (ou `useEffect` cleanup). Sem intervalos órfãos.
- **RECOMENDADO** — Polling pausa quando a aba está oculta (`document.hidden`) e retoma ao focar.
- **OBRIGATÓRIO** — Nenhum `setState` após unmount.

```ts
// padrão obrigatório de polling com cleanup
useEffect(() => {
  let alive = true;
  const id = setInterval(async () => {
    try {
      const r = await apiFetch<Room[]>('/api/chat/rooms');
      if (alive) setData(r);
    } catch (e) { if (alive) setError(e as ApiError); }
  }, 3000);
  return () => { alive = false; clearInterval(id); };
}, []);
```

### 4.3 Estados de UI e acessibilidade

| Estado | Regra | Obrigação |
| --- | --- | --- |
| **Loading** | Skeleton ou spinner, nunca tela branca. | **OBRIGATÓRIO** |
| **Erro** | Mensagem clara + ação "tentar novamente". | **OBRIGATÓRIO** |
| **Vazio** | Estado dedicado, com orientação. | **OBRIGATÓRIO** |
| **Sucesso** | Toast não bloqueante. | **RECOMENDADO** |

Acessibilidade (**OBRIGATÓRIO**):

- `aria-live="polite"` em regiões que atualizam por polling.
- Foco visível e navegável por teclado em todos os controles.
- Toasts com `role="status"`; erros críticos com `role="alert"`.
- Contraste mínimo AA (atenção especial ao amarelo — §5).

---

## 5. Design System UOL

### 5.1 Paleta de marca

| Token | Hex | Uso | Obrigação |
| --- | --- | --- | --- |
| `--uol-red` | `#CB0003` | Ação primária, marca, editoria principal | **OBRIGATÓRIO** |
| `--uol-orange` | `#ED5709` | Destaques, links de seção | **OBRIGATÓRIO** |
| `--uol-blue` | `#005FFF` | Interativos, foco, links | **OBRIGATÓRIO** |
| `--uol-yellow` | `#FFCE00` | Badges/destaques — **sempre com texto preto** | **OBRIGATÓRIO** |

> **Regra dura:** sobre `#FFCE00`, o texto é **preto** (`#000000`). Nunca branco. Isso garante contraste AA.

### 5.2 Cores por editoria (A CRITÉRIO)

| Editoria | Token sugerido | Cor |
| --- | --- | --- |
| Notícias / Geral | `--ed-geral` | `#CB0003` |
| Esportes | `--ed-esporte` | `#005FFF` |
| Economia | `--ed-economia` | `#1F7A1F` |
| Entretenimento | `--ed-entretenimento` | `#ED5709` |
| Tecnologia | `--ed-tec` | `#6A1B9A` |

- **RECOMENDADO** — Manter consistência: mesma editoria = mesma cor em todo o produto.
- **A CRITÉRIO** — Ajuste de matiz para contraste, mantendo a família de marca.

### 5.3 Tipografia

| Papel | Fonte | Obrigação |
| --- | --- | --- |
| Texto/UI | **Inter** | **OBRIGATÓRIO** |
| Código/dados/timestamps | **JetBrains Mono** | **OBRIGATÓRIO** |

- **RECOMENDADO** — Escala tipográfica modular; peso mínimo 400 para texto corrido.
- **OBRIGATÓRIO** — `JetBrains Mono` em `meta`, timestamps, latências e trechos técnicos.

### 5.4 Superfícies dark/light

- **OBRIGATÓRIO** — Tema **dark** e **light** via tokens (`--bg`, `--surface`, `--text`, `--muted`).
- **OBRIGATÓRIO** — Contraste AA em ambos os temas.
- **RECOMENDADO** — Respeitar `prefers-color-scheme`, com toggle manual persistido.

### 5.5 Micro-interações

| Efeito | Uso | Obrigação |
| --- | --- | --- |
| `active:scale-95` | Feedback de clique em botões/cards | **OBRIGATÓRIO** |
| `animate-ping` | Indicador "ao vivo" / presença | **OBRIGATÓRIO** |
| transição de cor/opacidade | Hover de links e chips | **RECOMENDADO** |

### 5.6 Anti-AI-slop e créditos

**Anti-AI-slop (OBRIGATÓRIO)** — proibido entregar:

- Gradiente roxo/azul genérico, emoji decorativo, "glassmorphism" sem propósito.
- Copy vaga ("Descubra um mundo de possibilidades"), lorem ipsum visível.
- Cards idênticos empilhados sem hierarquia; excesso de sombras e bordas arredondadas.

**Créditos (OBRIGATÓRIO)**:

- Rodapé com crédito da sprint e da fonte visual: **baseado em uol.com.br**.
- Sem emoji nos créditos; sem quebra de marca.

---

## 6. Template Canônico de Spec OpenSpec

Toda spec da sprint segue **exatamente** este formato. **OBRIGATÓRIO**.

Regras de spec:

- **OBRIGATÓRIO** — Seção `## ADDED Requirements` no arquivo de delta.
- **OBRIGATÓRIO** — Cada `### Requirement:` tem **descrição curta** (1–2 linhas) e **exatamente 1** `#### Scenario:` no formato **WHEN/THEN**.
- **OBRIGATÓRIO** — Contrato de API como **bloco de código** dentro do requirement.
- **OBRIGATÓRIO** — Seção **"UI & Aesthetic Contract"** em requirements com UI.
- **OBRIGATÓRIO** — Tasks com **track paralela** anotada: `[PARALLEL TRACK-A..D]`.
- **OBRIGATÓRIO** — `openspec validate <change> --strict` deve passar **sem avisos**.

```markdown
## ADDED Requirements

### Requirement: Listagem de salas do Bate-Papo
A API expõe a lista de salas ativas com contagem de online por sala.

#### Scenario: Listar salas ativas
- **WHEN** o cliente chama `GET /api/chat/rooms`
- **THEN** a API responde 200 com envelope `{ data, meta }`, cada sala com `id`, `name`, `online`, e `meta.latencyMs` preenchido

**API Contract**

```http
GET /api/chat/rooms
```

```json
{ "data": [ { "id": "sala-1", "name": "Debate", "online": 12 } ], "meta": { "latencyMs": 8, "contract": "v1" } }
```

**UI & Aesthetic Contract**

- `animate-ping` no indicador de presença; cor de interação `#005FFF`.
- Tipografia Inter; timestamps em JetBrains Mono; contraste AA em dark e light.

## Tasks

- [ ] [PARALLEL TRACK-B] Implementar `GET /api/chat/rooms` no backend.
- [ ] [PARALLEL TRACK-C] Componente `RoomList` com loading/erro/vazio.
- [ ] [PARALLEL TRACK-D] Cenário de teste: listagem + polling de 3s com cleanup.
```

Estrutura de uma change (referência): `openspec/changes/<nome>/` com `proposal.md`, `tasks.md`, `design.md` (opcional) e `specs/<capability>/spec.md`.

---

## 7. Roster de Agentes (7)

| Agente | Papel | Diretrizes curtas |
| --- | --- | --- |
| `@orchestrator` | Coordena tracks, resolve conflitos, aprova desvios. | Aplica precedência (§1), libera paralelismo, mantém dono exclusivo. |
| `@spec-architect` | Dono do contrato OpenSpec (Track A). | Escreve specs no template (§6), roda `--strict`, congela contrato. |
| `@backend-dev` | API REST Node/Express (Track B). | Envelope + telemetria, CORS, seed em memória, erros 400/404/500. |
| `@ui-art-director` | Guardião do Design System UOL. | Paleta, tipografia, editorias, micro-interações, anti-AI-slop. |
| `@frontend-dev` | React em `:3000` (Track C). | Fetch tipado, polling 3s com cleanup, toasts, estados, a11y. |
| `@code-reviewer` | Revisão de código e aderência a esta norma. | Verifica contrato, design, limpeza; classifica por severidade (§9). |
| `@qa-demo` | Cenários, evidências e demo (Track D). | Testa contra contrato, valida telemetria, monta demo final. |

- **OBRIGATÓRIO** — Cada agente atua **apenas** na sua track/diretório.
- **OBRIGATÓRIO** — `@code-reviewer` e `@qa-demo` são independentes de quem escreveu o código.

---

## 8. Cronograma (Sprint Curta)

Execução **em fases**, com paralelismo controlado. Duração total **A CRITÉRIO** (ajustável), fases são fixas.

| Fase | Janela | Atividades | Donos | Gate de saída |
| --- | --- | --- | --- | --- |
| **0 — Setup** | Início | Estrutura de diretórios, portas, `shared/`, tokens iniciais. | `@orchestrator` | Sistema sobe em `:3000`/`:3001`. |
| **1 — Contrato** | Fase inicial (bloqueante) | Specs dos 3 produtos, contrato REST, `--strict`. | `@spec-architect` | Contrato **congelado** e validado. |
| **2 — Paralelo** | Após Fase 1 | B: API+seed • C: UI+data layer • D: cenários. | `@backend-dev`, `@ui-art-director`, `@frontend-dev`, `@qa-demo` | Tracks concluem sem tocar código alheio. |
| **3 — Convergência** | Após Fase 2 | Integração front↔back, polling, design system aplicado. | B + C | Fluxos ponta-a-ponta funcionando. |
| **4 — Auditoria** | Após Fase 3 | Revisão + QA/Demo, classificação de achados. | `@code-reviewer`, `@qa-demo` | Relatório final (§9). |
| **5 — Fechamento** | Fim | Correções de BLOCKER/MAJOR, demo e Definition of Done. | `@orchestrator` | DoD atendido. |

- **OBRIGATÓRIO** — Fase 1 é **gate**: nenhum código de produto antes do contrato validado.
- **OBRIGATÓRIO** — Fases 2 é a **única** janela de paralelismo; auditoria é sempre na convergência.

---

## 9. Formato de Relatório e Definition of Done

### 9.1 Severidade

| Nível | Definição | Ação |
| --- | --- | --- |
| **BLOCKER** | Impede entrega, quebra contrato ou segurança. | Corrigir **antes** do fechamento. |
| **MAJOR** | Funcionalidade/UX relevante incorreta. | Corrigir **antes** do fechamento. |
| **MINOR** | Desvio pequeno, sem impacto crítico. | Corrigir se houver tempo; senão registrar. |
| **NIT** | Estilo/consistência. | Opcional; registrar. |

### 9.2 Template de relatório (OBRIGATÓRIO)

```markdown
# Relatório de Sprint — <data>

## Resumo
- Fases concluídas: 0..5
- Contrato validado (--strict): sim/não
- Tracks: A/B/C/D

## Achados
| ID | Severidade | Track | Descrição | Evidência | Recomendação |
| -- | ---------- | ----- | --------- | --------- | ------------ |
| 1  | BLOCKER    | B     | ...       | ...       | ...          |

## Conformidade
- Precedência (§1) respeitada: sim/não
- API envelope + latencyMs/contract: sim/não
- Design System (§5): sim/não
- Acessibilidade AA: sim/não

## Definition of Done
- [ ] ...

## Riscos e desvios aprovados
- ...
```

### 9.3 Definition of Done (OBRIGATÓRIO)

- [ ] Spec OpenSpec passa em `openspec validate --strict`.
- [ ] Contrato REST implementado, imutável e refletido no frontend.
- [ ] Todas as respostas com envelope `{ data, meta }` + `latencyMs`/`contract`.
- [ ] Erros `400/404/500` no formato padrão; `/health` respondendo.
- [ ] Frontend em `:3000` consumindo `:3001`, com CORS liberado.
- [ ] Fetch tipado, polling de 3s com cleanup, sem intervalos órfãos.
- [ ] Estados loading/erro/vazio e toasts implementados.
- [ ] Design System UOL aplicado (paleta, editorias, tipografia, dark/light, micro-interações).
- [ ] Acessibilidade AA verificada (incluindo amarelo com texto preto).
- [ ] Anti-AI-slop respeitado; créditos com base em uol.com.br.
- [ ] Nenhum achado BLOCKER/MAJOR pendente.
- [ ] Relatório (§9) publicado com evidências.
