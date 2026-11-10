## ADDED Requirements

### Requirement: Destaques da home
A API SHALL expor os destaques da home com posição, rótulo e o artigo correspondente, para a tela `Home`.

#### Scenario: Listar destaques da home
- **WHEN** o cliente chama `GET /api/portal/highlights`
- **THEN** a API responde 200 com envelope `{ data, meta }`, cada destaque com `position`, `label` e o `article` (`id`, `title`, `summary`, `editoria`, `imageUrl`), e `meta.latencyMs` preenchido

**API Contract**

```http
GET /api/portal/highlights
```

```json
{
  "data": [
    {
      "articleId": "art-1",
      "position": 1,
      "label": "Destaque",
      "article": { "id": "art-1", "title": "Manchete principal", "summary": "...", "editoria": "economia", "imageUrl": "https://.../a.jpg" }
    }
  ],
  "meta": { "latencyMs": 6, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b", "ts": "2026-11-10T12:00:00.000Z" }
}
```

**UI & Aesthetic Contract**

- Bloco de destaque principal (hero) **no topo da home com ênfase máxima** (baseado em uol.com.br, §1):
  imagem em largura total e manchete em corpo ampliado, acima de qualquer outra seção.
- Manchete em Inter; editoria em seu token de cor (§5.2).
- Atualização por polling com `aria-live="polite"`; contraste AA em dark e light.

### Requirement: Seção Últimas notícias da home
A tela `Home` SHALL exibir a seção "Últimas notícias" **abaixo** do destaque principal, em duas colunas:
cards de destaque à esquerda e, à direita, uma listagem numerada de notícias com design baseado no
bloco "mais lidas" da página uol.com.br (§1), alimentada por `GET /api/portal/articles?limit=5`.

#### Scenario: Abrir a home e ver a seção Últimas notícias
- **WHEN** a tela `Home` é aberta com destaques disponíveis
- **THEN** a UI SHALL renderizar o destaque principal no topo e, abaixo, a seção "Últimas notícias"
  com os cards de destaque na coluna esquerda e a listagem numerada (estilo "mais lidas") na coluna direita

**API Contract**

```http
GET /api/portal/articles?limit=5
```

```json
{ "data": [ { "id": "art-2", "title": "Título", "summary": "...", "editoria": "esportes", "publishedAt": "2026-11-10T09:00:00.000Z", "imageUrl": "https://.../b.jpg", "url": "/leitura/art-2" } ], "meta": { "latencyMs": 3, "contract": "v1" } }
```

**UI & Aesthetic Contract**

- Coluna esquerda: cards de destaque existentes (hierarquia preservada, § anti-AI-slop).
- Coluna direita: bloco com cabeçalho "Mais lidas" e lista numerada 1–5 — número em destaque na cor
  da marca, título com hover sublinhado, divisores finos entre itens (padrão "mais lidas" do uol.com.br).
- Estados `loading`/`erro`/`vazio` obrigatórios em ambas as colunas (§4.3); contraste AA em dark e light.

### Requirement: Atualização automática da home
A tela `Home` SHALL atualizar os destaques automaticamente por polling, sem intervalos órfãos.

#### Scenario: Atualização periódica dos destaques
- **WHEN** a tela `Home` está montada e visível
- **THEN** os destaques SHALL ser rebuscados a cada 3s e o intervalo SHALL ser limpo no unmount

**UI & Aesthetic Contract**

- Skeleton de carregamento durante o primeiro fetch; nunca tela branca (§4.3).
