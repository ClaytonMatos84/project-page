## ADDED Requirements

### Requirement: Listagem de salas do Bate-Papo
A API SHALL expor a lista de salas ativas via `GET /api/chat/rooms`, cada uma com `id`, `name`,
`topic` (evento ao vivo), `online`, `capacity` (lotação) e `color` (acento de editoria §5.2).

#### Scenario: Listar salas ativas
- **WHEN** o cliente chama `GET /api/chat/rooms`
- **THEN** a API responde 200 com envelope `{ data, meta }` e as 4 salas seed (Arquibancada Esporte, Devs & OpenCode, Paquera SP, Splash Reality), cada uma com `online` ≤ `capacity` e `meta.latencyMs` preenchido

**API Contract**

```http
GET /api/chat/rooms
```

```json
{
  "data": [
    {
      "id": "arquibancada",
      "name": "Arquibancada Esporte",
      "topic": "Debate da rodada: quem leva o título?",
      "online": 35,
      "capacity": 40,
      "color": "#005FFF",
      "createdAt": "2026-11-10T09:00:00.000Z"
    },
    {
      "id": "devs-opencode",
      "name": "Devs & OpenCode",
      "topic": "Ao vivo: agents escrevendo specs",
      "online": 12,
      "capacity": 40,
      "color": "#6A1B9A",
      "createdAt": "2026-11-10T09:00:00.000Z"
    }
  ],
  "meta": { "latencyMs": 4, "contract": "v1", "traceId": "b7e1c2a4-9f03-4d1e-8a2b-1c2d3e4f5a6b" }
}
```

**UI & Aesthetic Contract**

- Barra de lotação clássica por sala: preenchimento amarelo `--uol-yellow` (texto **preto** §5.1),
  **vermelho `--uol-red` quando ocupação > 80%**; contagem "35/40" em JetBrains Mono (§5.3).
- Sala ativa destacada na `color` da sala; clique com `active:scale-95` (§5.5).
- Tópico ao vivo no banner da sala com indicador `animate-ping` (§5.5).
