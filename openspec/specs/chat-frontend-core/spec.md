# chat-frontend-core

## Purpose
Define the Bate-Papo UOL Next-Gen frontend core capability: room selection, 3-column room UI, entry modal, composer, reactions, portal navigation, and polling/a11y.

## Requirements

### Requirement: Tela inicial com seleção de sala
Ao abrir `/bate-papo`, o frontend SHALL mostrar uma tela inicial com cards das salas disponíveis e
não SHALL entrar automaticamente em nenhuma sala. Cada card apresenta nome, tópico e dados
existentes, incluindo quantidade de usuários e lotação quando disponíveis.

#### Scenario: Consultar salas antes de entrar
- **WHEN** o usuário abre `/bate-papo` pelo Header do portal
- **THEN** a UI SHALL exibir os cards alimentados por `GET /api/chat/rooms` e aguardar a seleção explícita de uma sala antes de solicitar entrada

**API Contract**

```http
GET /api/chat/rooms
```

```json
{ "data": [{ "id": "arquibancada", "name": "Arquibancada Esporte", "topic": "Debate da rodada", "online": 35, "capacity": 40, "color": "#005FFF" }], "meta": { "latencyMs": 4, "contract": "v1" } }
```

**UI & Aesthetic Contract**

- Cards distinguíveis por nome, tópico e contagem `online/capacity` em JetBrains Mono; dados opcionais ausentes não devem ser inventados.
- Seleção de card com `active:scale-95`, foco visível e navegação por teclado; loading, erro com ação de tentar novamente e estado vazio dedicado.

### Requirement: Sala de bate-papo em 3 colunas
Após selecionar uma sala e concluir a entrada, o frontend SHALL exibir 3 colunas: **esquerda** —
lista de salas com barra de lotação clássica e troca rápida de nick; **centro** — feed de mensagens
com banner de evento ao vivo no topo; **direita** — participantes online da sala, onde clicar em
um nick o seleciona como destinatário automaticamente. No mobile as colunas **colapsam** com o
feed prioritário.

#### Scenario: Entrar na sala selecionada
- **WHEN** o usuário seleciona um card, informa um apelido disponível e a API confirma a entrada
- **THEN** a UI SHALL exibir as 3 colunas com a sala escolhida destacada, o banner com o tópico ao vivo e o apelido do usuário na lista de participantes

**API Contract**

```ts
const enter: EnterResult = await apiFetch<EnterResult>(`/api/chat/rooms/${roomId}/enter`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nick }),
});
const feed: RoomFeed = await apiFetch<RoomFeed>(`/api/chat/rooms/${roomId}/messages?nick=${nick}`);
```

**UI & Aesthetic Contract**

- Barra de lotação: preenchimento amarelo `--uol-yellow` (texto **preto** §5.1), vermelho
  `--uol-red` acima de 80%; contagem "35/40" em JetBrains Mono.
- Banner de evento ao vivo com `topic` da sala e indicador `animate-ping` (§5.5).
- Participantes com hover de transição de cor (§5.5) e `aria-label` "conversar com {nick}";
  o nick do próprio usuário destacado.
- Mobile: salas e participantes em seções colapsáveis acima/abaixo do feed.

### Requirement: Modal de entrada com apelido
Após a seleção de uma sala, o frontend SHALL exigir apelido via modal de entrada (tela `Entrada`
do §3.3): campo com validação `^[\w-]{2,24}$` espelhando o `400`, erro de apelido em uso exibido
com `role="alert"` e nick salvo em `localStorage` apenas para preenchimento, nunca para entrada
automática ao abrir a rota ou voltar à tela inicial.

#### Scenario: Entrar com apelido já usado por seed
- **WHEN** o usuário tenta entrar como "gata_sp_98" na Paquera SP e a API responde 400 (apelido em uso)
- **THEN** a UI SHALL exibir o erro no modal com `role="alert"` e manter o foco no campo para correção

**API Contract**

```ts
const enter: EnterResult = await apiFetch<EnterResult>(`/api/chat/rooms/${roomId}/enter`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nick }),
});
```

**UI & Aesthetic Contract**

- Modal com `role="dialog"`, focus trap, `Esc` fecha e retorno de foco (precedente do flash).
- Nicks de seed visíveis na lista de participantes como sugestão de ambiente, não como opções; nick salvo pode preencher o campo, mas exige confirmação explícita.

### Requirement: Sair da sala e encerrar presença
A UI SHALL oferecer uma ação explícita para sair da sala, chamar o endpoint de saída antes de retornar
à tela inicial, trocar de sala ou navegar ao portal e só então deixar de exibir o usuário como
participante. Ao voltar ao bate-papo, o usuário precisa selecionar uma sala e confirmar novamente
a entrada.

#### Scenario: Sair e entrar novamente
- **WHEN** o usuário sai da sala e depois a seleciona novamente com o mesmo apelido
- **THEN** a UI SHALL remover sua presença antes de exibir a tela inicial e solicitar uma nova entrada, sem receber erro de apelido em uso

**API Contract**

```http
POST /api/chat/rooms/:id/leave
Content-Type: application/json
```

```json
{ "nick": "visitante_2026" }
```

**UI & Aesthetic Contract**

- A ação de saída tem foco visível, funciona por teclado e usa `active:scale-95`; falha na saída deve mostrar erro com ação de tentar novamente e não simular remoção concluída.

### Requirement: Composer clássico com ação, destinatário e reservadamente
O frontend SHALL oferecer a barra clássica inferior de composição: seletor de **Ação**
(`fala para`/`grita com`/`sussurra para`/`concorda com`), seletor de **Destinatário**
(`Todos` + participantes da sala), checkbox **"Reservadamente"** e campo de texto, enviando via
`POST /api/chat/rooms/:id/messages`; `isPrivate` com destinatário `Todos` é bloqueado
client-side com mensagem inline.

#### Scenario: Enviar sussurro reservado
- **WHEN** o usuário seleciona "sussurra para" + nick de um participante, marca "Reservadamente", digita o texto e envia
- **THEN** a UI SHALL chamar o POST com `isPrivate: true` e a mensagem aparece no feed com fundo amarelo, texto preto e badge "reservada"

**API Contract**

```ts
const message: Message = await apiFetch<Message>(`/api/chat/rooms/${roomId}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ author: nick, action, recipient, text, isPrivate }),
});
```

**UI & Aesthetic Contract**

- Renderização por ação no feed: `fala para` = nick em bold; `grita com` = caixa alta +
  vermelho `--uol-red`; `sussurra para` = itálico muted; `concorda com` = azul `#005FFF`;
  reservada = fundo `--uol-yellow` com texto **preto** (§5.1) + badge.
- Enviar com `active:scale-95`; foco visível em todos os controles; Enter envia, `Shift+Enter`
  quebra linha (quando aplicável ao input).

### Requirement: Reações nas mensagens do feed
O frontend SHALL oferecer botões de reação `👍`/`😂`/`❤️` por mensagem do feed, chamando
`POST /api/chat/messages/:id/react` com dedup por browser (`localStorage`, 1 reação por emoji
por mensagem), contadores atualizados in-place pelo polling.

#### Scenario: Rir de uma mensagem pública
- **WHEN** o usuário clica em `😂` em uma mensagem que ainda não reagiu neste browser
- **THEN** a UI SHALL chamar o POST com `{ "emoji": "😂" }`, incrementar o contador in-place e desabilitar nova reação de `😂` nesta mensagem

**API Contract**

```ts
const message: Message = await apiFetch<Message>(`/api/chat/messages/${messageId}/react`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ emoji }),
});
```

**UI & Aesthetic Contract**

- Botões com `active:scale-95` e `aria-label` descritivo ("rir da mensagem"); emojis são
  funcionais, não decorativos (§5.6).
- `key={message.id}` estável — polling atualiza contadores sem remontar o feed.

### Requirement: Navegação bidirecional com o portal
O frontend SHALL linkar "Bate-Papo" no Header do portal (ao lado de "Flash") e "voltar ao
portal" na barra superior do `/bate-papo`.

#### Scenario: Voltar ao portal a partir do bate-papo
- **WHEN** o usuário clica em "voltar ao portal" enquanto está em uma sala
- **THEN** a UI SHALL chamar a saída explícita da sala e, após sucesso, navegar para `/` do Mini Portal UOL

**API Contract**

```tsx
// Header do portal (Layout): <NavLink to="/bate-papo">Bate-Papo</NavLink>
// Barra do chat: <Link to="/">← voltar ao portal</Link>
```

**UI & Aesthetic Contract**

- Link do Header no estilo dos atalhos de produto (`font-extrabold text-brand-red`,
  precedente do "Flash"); link de volta discreto, sem quebra de marca.
- Rodapé do `/bate-papo` com créditos "baseado em uol.com.br", sem emoji (§5.6).

### Requirement: Polling, estados de UI e acessibilidade
O frontend SHALL manter pollers de 3s com cleanup via `usePolling` (salas; mensagens + participantes
somente enquanto houver sala ativa), estados `loading`/`erro`/`vazio` por região (§4.3), re-entrada
automática ao retomar o foco apenas se a sessão ativa expirou por TTL, feed com `role="log"` e
`aria-live="polite"` no contador de online.


#### Scenario: Presença sobrevive ao retorno de foco
- **WHEN** a aba fica oculta além do TTL de presença (polling pausado por `document.hidden`) e o usuário retorna
- **THEN** a UI SHALL re-entrar automaticamente com o nick salvo antes do próximo render e o usuário permanece na lista de participantes

**API Contract**

```ts
// Poller 1: salas + lotação (3s)
const rooms: Room[] = await apiFetch<Room[]>('/api/chat/rooms');
// Poller 2: feed + participantes + sinal de vida do nick (3s)
const feed: RoomFeed = await apiFetch<RoomFeed>(`/api/chat/rooms/${roomId}/messages?nick=${nick}`);
```

**UI & Aesthetic Contract**

- `usePolling` existente: cleanup no unmount, pausa em `document.hidden`, sem intervalos órfãos
  e sem `setState` após unmount (§4.2).
- Loading: skeleton nas 3 colunas (nunca tela branca); erro: `role="alert"` + "tentar
  novamente"; vazio: orientação dedicada (§4.3).
- `aria-live="polite"` no contador de online; foco visível e navegável por teclado em todos
  os controles; contraste AA em dark e light (§5.4).
