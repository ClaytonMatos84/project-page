# flash-frontend-core

## Purpose
Define the UOL Flash Short feed UI, interactions, and accessibility behavior.

## Requirements

### Requirement: Feed vertical imersivo com moldura de smartphone
O frontend SHALL expor a rota imersiva `/flash` (fora do `Layout` do portal) com moldura de smartphone 9:16 centralizada e feed vertical `snap-y snap-mandatory` (`overflow-y-scroll`), um short por tela, com mídia vertical de fundo, chip de editoria na cor do token, badge de tempo de leitura (`durationMs`) e título + resumo (`body`) sobre a mídia.

#### Scenario: Abrir o feed de shorts
- **WHEN** o usuário abre `/flash` com shorts disponíveis na API
- **THEN** a UI SHALL exibir a moldura com o feed snap vertical, cada card com mídia, chip de editoria, badge de tempo, título e resumo

**API Contract**

```ts
const shorts: Short[] = await apiFetch<Short[]>('/api/flash/shorts?sort=recent&limit=20');
```

**UI & Aesthetic Contract**

- `snap-y snap-mandatory` no container; `key={short.id}` estável por card.
- Texto sobre a mídia com scrim para contraste AA; `durationMs` em JetBrains Mono; chip de editoria no token (§5.2).
- Mídia com `onError` → superfície de fallback na cor da editoria (nunca tela branca).
- Atalho discreto de retorno ao portal; rodapé de créditos "baseado em uol.com.br" (§5.6).

### Requirement: Rail de ações flutuante
O frontend SHALL exibir rail de ações flutuante à direita do card atual com: **Curtir** (`POST /reactions`, dedup por `localStorage`, contador atualizado), **Ler Matéria Completa** (abre bottom sheet quando o short tem `articleUrl`), **Compartilhar** (`navigator.share` com fallback para clipboard + toast) e **Publicar** (abre modal de publicação).

#### Scenario: Curtir o short visível
- **WHEN** o usuário clica em Curtir no short visível (não curtido antes neste browser)
- **THEN** a UI SHALL chamar `POST /api/flash/shorts/:id/reactions`, atualizar o contador, guardar o short no `localStorage` e desabilitar nova curtida neste browser

**API Contract**

```ts
const reaction: Reaction = await apiFetch<Reaction>(`/api/flash/shorts/${id}/reactions`, { method: 'POST' });
```

**UI & Aesthetic Contract**

- Botões com `active:scale-95`, foco visível e `aria-label` descritivo.
- Compartilhar: `navigator.share({ title, url: articleUrl })` → fallback `clipboard.writeText` + toast `role="status"`.

### Requirement: Toggle Recentes / Mais curtidos
O frontend SHALL oferecer toggle **Recentes / Mais curtidos** no topo do feed que alterna entre `sort=recent` e `sort=popular`, materializando a tela `Curtidas` (reação/ranking) do §3.2. A reordenação SHALL acontecer apenas por ação explícita do usuário no toggle.

#### Scenario: Alternar para Mais curtidos
- **WHEN** o usuário seleciona "Mais curtidos" no toggle
- **THEN** a UI SHALL refetch com `sort=popular` e exibir o feed ordenado por `reactions` desc

**API Contract**

```ts
const popular: Short[] = await apiFetch<Short[]>('/api/flash/shorts?sort=popular&limit=20');
```

**UI & Aesthetic Contract**

- Toggle com transição de cor/opacidade (§5.5) e estado selecionado perceptível além de cor (a11y).

### Requirement: Modal de publicação de short
O frontend SHALL oferecer modal de publicação com campos `title`, `body`, `editoria` (select das 5 canônicas), `mediaUrl`, `mediaType` (`image`|`video`), `articleUrl` opcional e enquete opcional (`question` + 2–4 opções), enviando `POST /api/flash/shorts`; erro `400` exibido com mensagem clara; sucesso fecha o modal, exibe toast e o short aparece no topo do feed `Recentes`.

#### Scenario: Publicar um short válido
- **WHEN** o usuário preenche o modal com dados válidos e confirma
- **THEN** a UI SHALL enviar `POST /api/flash/shorts`, fechar o modal, exibir toast `role="status"` e inserir o short no topo do feed

**API Contract**

```ts
const created: Short = await apiFetch<Short>('/api/flash/shorts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, body, editoria, mediaUrl, mediaType, articleUrl, poll }),
});
```

**UI & Aesthetic Contract**

- `role="dialog"` + `aria-modal="true"`; focus trap, `Esc` fecha, foco retorna ao gatilho.
- Validação client-side espelha as regras do contrato; erro do servidor nunca engolido (§2.3).

### Requirement: Bottom sheet da matéria completa
O frontend SHALL abrir bottom sheet "Ler Matéria Completa" a partir do rail quando o short tem `articleUrl`, exibindo título, resumo, chip de editoria e ação de abrir a matéria original (`target="_blank"` com `rel="noopener noreferrer"`).

#### Scenario: Abrir a matéria do short
- **WHEN** o usuário clica em Ler Matéria Completa em um short com `articleUrl`
- **THEN** a UI SHALL abrir o bottom sheet com o conteúdo do short e a ação de abrir a matéria original

**API Contract**

```ts
const detail: Short = await apiFetch<Short>(`/api/flash/shorts/${id}`);
```

**UI & Aesthetic Contract**

- Focus trap + `Esc` fecha + foco retorna ao botão do rail; contraste AA no sheet em dark e light.

### Requirement: Polling do feed com contadores in-place
O frontend SHALL atualizar o feed por polling de 3s (reuso de `usePolling`, com cleanup e pausa em `document.hidden`) mantendo `key={short.id}` estável: contadores de curtida e enquete atualizam in-place sem remontar cards, perder o snap/scroll ou reordenar o feed.

#### Scenario: Polling atualiza contadores sem mover o card
- **WHEN** o polling de 3s retorna dados atualizados enquanto o usuário está em um card
- **THEN** os contadores do card visível SHALL atualizar in-place e o card sob o usuário SHALL permanecer o mesmo (sem reordenação automática)

**API Contract**

```ts
const { data: shorts } = usePolling<Short[]>(
  () => apiFetch<Short[]>(`/api/flash/shorts?sort=${sort}&limit=20`), 3000
);
```

**UI & Aesthetic Contract**

- `aria-live="polite"` **apenas** na região de contadores do card visível (nunca no feed inteiro).
- Nenhum `setState` após unmount; sem intervalos órfãos (§4.2).

### Requirement: Navegação por teclado no feed
O feed SHALL ser navegável por teclado: setas ↑/↓ (ou botões prev/next) movem entre shorts com snap, todo controle com foco visível e navegável.

#### Scenario: Navegar entre shorts por teclado
- **WHEN** o usuário pressiona ↓ com o foco no feed
- **THEN** a UI SHALL rolar com snap para o próximo short, mantendo o foco visível

**UI & Aesthetic Contract**

- Ordem de tab lógica (toggle → rail → enquete); `prefers-reduced-motion` respeitado (sem animação de rolagem suave).

### Requirement: Estados de UI do feed
O feed SHALL implementar estados `loading` (skeleton), `erro` (mensagem clara + "tentar novamente") e `vazio` (orientação dedicada, ex.: "Nenhum short publicado ainda — publique o primeiro").

#### Scenario: Falha de rede no feed
- **WHEN** a requisição do feed falha
- **THEN** a UI SHALL exibir mensagem clara com ação "tentar novamente", sem tela branca; erro crítico com `role="alert"`

**UI & Aesthetic Contract**

- Skeleton na moldura do smartphone durante `loading`; vazio com orientação + atalho para o modal de publicação.

### Requirement: Enquete interativa sobre a mídia
O frontend SHALL renderizar a enquete do short (`poll`) sobre a mídia: opções clicáveis com `active:scale-95`; voto via `POST /vote`; após votar (ou se já votado neste browser via `localStorage`), exibe barras de percentual por opção e `totalVotes` em `aria-live="polite"`.

#### Scenario: Votar na enquete do short visível
- **WHEN** o usuário clica em uma opção da enquete do short visível (não votado antes neste browser)
- **THEN** a UI SHALL chamar `POST /api/flash/shorts/:id/vote`, exibir percentuais com barras, guardar o voto no `localStorage` e travar nova votação neste browser

**API Contract**

```ts
const poll: Poll = await apiFetch<Poll>(`/api/flash/shorts/${id}/vote`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ optionId }),
});
```

**UI & Aesthetic Contract**

- Barras na cor da editoria com contraste AA; percentuais e `totalVotes` em `aria-live="polite"`.
- Voto dedup por browser (1 voto por short); erro do contrato exibido sem engolir (§2.3).
