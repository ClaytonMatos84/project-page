# Mini Portal e Flash Short

Aplicação de demonstração composta por um Mini Portal e uma experiência de notícias curtas Flash Short. O frontend React consome uma API REST tipada; os dados são carregados de seeds e mantidos em memória pela API.

## Funcionalidades

- **Mini Portal**: página inicial com destaques e artigos, navegação por editoria, leitura de artigo e busca.
- **Flash Short**: feed ordenado por recentes ou populares, reações, enquetes e publicação de shorts.
- **Interface**: temas claro e escuro, estados de carregamento/erro/vazio, layout responsivo e recursos de acessibilidade.
- **API**: respostas no envelope `{ data, meta }`, telemetria, CORS liberado para desenvolvimento e rota de saúde.

## Tecnologias

- React 18, TypeScript, Vite, Tailwind CSS e React Router
- Node.js, Express 5 e TypeScript
- npm workspaces para `frontend`, `backend` e `shared`

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Como executar

Na raiz do repositório, instale as dependências:

```bash
npm install
```

Inicie a API e o frontend em terminais separados:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Abra <http://localhost:3000>. A API fica disponível em <http://localhost:3001> e o endpoint de saúde em <http://localhost:3001/health>.

O frontend usa `http://localhost:3001` como endereço padrão da API. Para apontar para outro endereço, defina `VITE_API_URL` antes de iniciar o Vite, por exemplo:

```bash
VITE_API_URL=http://localhost:3001 npm run dev:frontend
```

## Scripts

Execute os comandos na raiz do projeto:

| Comando | Descrição |
| --- | --- |
| `npm run dev:backend` | Inicia a API em modo de desenvolvimento na porta `3001`. |
| `npm run dev:frontend` | Inicia o frontend Vite na porta `3000`. |
| `npm run typecheck` | Executa a verificação de tipos dos workspaces. |
| `npm run qa` | Executa os testes smoke básicos da API (`/health` e envelope de erro). |
| `npm run qa:portal` | Executa os testes smoke do Mini Portal. |
| `npm run qa:a11y` | Executa as verificações de acessibilidade do portal. |
| `npm run qa:flash` | Executa os testes smoke do Flash Short. |
| `npm run qa:flash:a11y` | Executa as verificações de acessibilidade do Flash. |

Para gerar o build do frontend:

```bash
npm run build --workspace @uol/frontend
```

Os scripts de QA que fazem chamadas HTTP precisam da API ativa. Para executá-los, mantenha `npm run dev:backend` rodando em outro terminal. A verificação de contraste pode ser executada com `node qa/scripts/contrast.mjs`. Detalhes dos cenários e comandos também estão em [`qa/README.md`](./qa/README.md).

## Rotas principais

### Interface

| Rota | Página |
| --- | --- |
| `/` | Início do Mini Portal |
| `/editoria/:slug` | Artigos de uma editoria |
| `/leitura/:id` | Detalhe de um artigo |
| `/busca?q=termo` | Busca de artigos |
| `/flash` | Feed Flash Short |

### API

Todas as respostas seguem o envelope `{ data, meta }`; erros também incluem `data: null` e um objeto `error`.

| Método e endpoint | Descrição |
| --- | --- |
| `GET /health` | Estado e versão da API. |
| `GET /api/portal/highlights` | Destaques da página inicial. |
| `GET /api/portal/editorias` | Lista de editorias. |
| `GET /api/portal/articles?editoria=<slug>&limit=<n>` | Lista artigos, com filtro e limite opcionais. |
| `GET /api/portal/articles/:id` | Detalhe de artigo. |
| `GET /api/portal/search?q=<termo>` | Busca por título e resumo. |
| `GET /api/flash/shorts?sort=recent|popular&limit=<n>` | Feed de shorts. |
| `GET /api/flash/shorts/:id` | Detalhe de short. |
| `POST /api/flash/shorts` | Publica um short. |
| `POST /api/flash/shorts/:id/reactions` | Registra uma reação. |
| `POST /api/flash/shorts/:id/vote` | Registra voto em uma enquete. |

## Estrutura do repositório

```text
frontend/   Aplicação React, páginas, componentes e estilos
backend/    API Express, rotas, seeds em memória e telemetria
shared/     Tipos e contrato compartilhados entre frontend e backend
openspec/   Specs funcionais e mudanças OpenSpec
qa/         Cenários, scripts e documentação de QA
few-shots/  Referências de design e exemplos
```

Os dados da API são mantidos em memória e reiniciam com o processo. Os tipos e envelopes compartilhados ficam em `shared/`; os contratos funcionais estão documentados em `openspec/`.

## Design e créditos

A interface segue a identidade visual UOL, com temas claro e escuro e estados de interface acessíveis. Referência visual: [uol.com.br](https://uol.com.br).
