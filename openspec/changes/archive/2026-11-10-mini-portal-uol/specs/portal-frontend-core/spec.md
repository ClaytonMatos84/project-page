## ADDED Requirements

### Requirement: Fetch tipado desembrulhando o envelope
O frontend SHALL usar um wrapper `apiFetch<T>()` que tipa a resposta pelo contrato e devolve o `data` desembrulhado.

#### Scenario: Consumir endpoint do portal
- **WHEN** um componente chama `apiFetch<Article[]>('/api/portal/articles?editoria=esportes')`
- **THEN** o wrapper SHALL retornar o array tipado de `Article` já desembrulhado de `{ data, meta }`

**API Contract**

```ts
const articles: Article[] = await apiFetch<Article[]>('/api/portal/articles?editoria=esportes');
```

**UI & Aesthetic Contract**

- Nenhum dado hardcoded na UI além de fallback de erro/vazio (§2.1).

### Requirement: Erros tipados
Erros do wrapper SHALL virar exceção tipada `ApiError` (com `status`/`code`), nunca `throw` de string.

#### Scenario: Tratar erro 404
- **WHEN** `apiFetch` recebe uma resposta de erro da API
- **THEN** SHALL lançar `ApiError` com `status` e `code` preenchidos, capturável pelo componente

**API Contract**

```ts
try { await apiFetch<Article>('/api/portal/articles/nao-existe'); }
catch (e) { if (e instanceof ApiError && e.status === 404) { /* estado de erro */ } }
```

### Requirement: Polling de 3s com cleanup
A camada de dados SHALL fazer polling a cada 3s **com cleanup** no unmount, sem intervalos órfãos.

#### Scenario: Desmontar componente durante polling
- **WHEN** um componente que faz polling é desmontado
- **THEN** o intervalo SHALL ser limpo (`clearInterval`) e nenhum `setState` SHALL ocorrer após o unmount

**API Contract**

```ts
useEffect(() => {
  let alive = true;
  const id = setInterval(async () => {
    try { const r = await apiFetch<Highlight[]>('/api/portal/highlights'); if (alive) setData(r); }
    catch (e) { if (alive) setError(e as ApiError); }
  }, 3000);
  return () => { alive = false; clearInterval(id); };
}, []);
```

### Requirement: Polling pausa com aba oculta
O polling SHALL pausar quando a aba estiver oculta (`document.hidden`) e retomar ao focar.

#### Scenario: Aba em segundo plano
- **WHEN** a aba fica oculta
- **THEN** o polling SHALL pausar e SHALL retomar automaticamente quando a aba voltar a ficar visível

### Requirement: Estados de UI obrigatórios
A UI SHALL implementar estados `loading`, `erro` e `vazio` para cada tela que consome a API.

#### Scenario: Falha de rede na listagem
- **WHEN** a requisição falha
- **THEN** a UI SHALL exibir mensagem clara + ação "tentar novamente"; `loading` usa skeleton/spinner (nunca tela branca) e `vazio` usa estado dedicado com orientação

**UI & Aesthetic Contract**

- Toasts de sucesso não bloqueantes com `role="status"` (§4.3).

### Requirement: Acessibilidade AA
A UI SHALL atender contraste mínimo AA e navegação por teclado, com regiões de polling `aria-live="polite"`.

#### Scenario: Região atualizada por polling
- **WHEN** uma região da UI é atualizada automaticamente por polling
- **THEN** essa região SHALL ter `aria-live="polite"`, todo controle SHALL ter foco visível e navegação por teclado, e o contraste SHALL ser AA em dark e light

**UI & Aesthetic Contract**

- Atenção especial ao amarelo `#FFCE00`: texto sempre preto (§5.1).
