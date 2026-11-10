# portal-editorias

## Purpose
Define editorial listing and navigation behavior for the UOL Mini Portal.

## Requirements

### Requirement: Lista de editorias
A API SHALL expor as editorias com `id`, `name`, `slug` e `color`, para navegação e chips.

#### Scenario: Listar editorias
- **WHEN** o cliente chama `GET /api/portal/editorias`
- **THEN** a API responde 200 com envelope `{ data, meta }`, cada editoria com `id`, `name`, `slug` e `color`, e `meta.latencyMs` preenchido

**API Contract**

```http
GET /api/portal/editorias
```

```json
{
  "data": [
    { "id": "geral", "name": "Notícias", "slug": "noticias", "color": "#CB0003" },
    { "id": "esporte", "name": "Esportes", "slug": "esportes", "color": "#005FFF" }
  ],
  "meta": { "latencyMs": 2, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Chips de editoria usando o token `color` da própria editoria, consistentes em todo o produto (§5.2).
- Hover com transição de cor/opacidade; foco visível e navegável por teclado.

### Requirement: Navegação por editoria
A UI SHALL permitir navegar da `Home` para a tela `Editoria` de uma editoria específica.

#### Scenario: Abrir editoria a partir da navegação
- **WHEN** o usuário seleciona uma editoria na navegação ou em um chip
- **THEN** a UI SHALL abrir a rota da tela `Editoria` correspondente ao `slug` da editoria

**UI & Aesthetic Contract**

- Navegação **horizontal estilo uol.com.br** (§1): links de texto em negrito, separados por divisores finos, na faixa do header — não chips/pílulas.
- Estado ativo da editoria destacado com sua cor; hover com transição de cor/opacidade.
- Foco visível e navegável por teclado.

### Requirement: Atalho para o UOL Flash no navigation
A navegação do portal SHALL exibir um atalho "Flash" que redireciona para a página do UOL Flash Short do próprio projeto (rota `/flash`), como o item "Flash" do menu do uol.com.br (§1).

#### Scenario: Redirecionar para o UOL Flash
- **WHEN** o usuário seleciona o atalho "Flash" na navegação do portal
- **THEN** a UI SHALL navegar para a rota `/flash` do UOL Flash Short

**UI & Aesthetic Contract**

- Atalho "Flash" na mesma faixa horizontal das editorias, com a cor de marca `--uol-red` (§5.1) e `active:scale-95` no clique; foco visível por teclado.
