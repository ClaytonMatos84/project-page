# design-tokens

## Purpose
Definir tokens visuais UOL, tipografia, temas, micro-interações e créditos dos produtos.

## Requirements

### Requirement: Paleta de marca UOL
O sistema SHALL expor os tokens de marca `--uol-red` (`#CB0003`), `--uol-orange` (`#ED5709`),
`--uol-blue` (`#005FFF`) e `--uol-yellow` (`#FFCE00`), e SHALL usar texto **preto** sobre o amarelo.

#### Scenario: Badge de destaque em amarelo
- **WHEN** um badge usa o fundo `--uol-yellow` (`#FFCE00`)
- **THEN** o texto do badge SHALL ser `#000000` (nunca branco), garantindo contraste AA

**UI & Aesthetic Contract**

- `--uol-red` em ação primária/marca; `--uol-orange` em destaques; `--uol-blue` em interativos/foco.
- Regra dura: sobre `#FFCE00`, texto preto `#000000`.

### Requirement: Cores por editoria
O sistema SHALL mapear as **cinco editorias** (`Notícias/Geral`, `Esportes`, `Economia`,
`Entretenimento`, `Tecnologia`) cada uma a um token de cor consistente em todos os produtos.

#### Scenario: Chip de editoria colorido
- **WHEN** a UI exibe uma editoria (ex.: Esportes)
- **THEN** o token da editoria SHALL ser aplicado de forma consistente (`--ed-esporte` = `#005FFF`) em qualquer tela

**UI & Aesthetic Contract**

- Notícias/Geral `#CB0003`; Esportes `#005FFF`; Economia `#1F7A1F`; Entretenimento `#ED5709`; Tecnologia `#6A1B9A`.
- As cinco editorias são fixas nesta sprint; mesma editoria = mesma cor em todo o produto.

### Requirement: Tipografia Inter e JetBrains Mono
A UI SHALL usar **Inter** para texto/UI e **JetBrains Mono** para dados técnicos (meta, timestamps, latências).

#### Scenario: Exibição de timestamp técnico
- **WHEN** a UI exibe `publishedAt`, `latencyMs` ou qualquer timestamp técnico
- **THEN** o texto SHALL usar a família **JetBrains Mono**; o restante do texto SHALL usar **Inter**

**UI & Aesthetic Contract**

- Peso mínimo 400 para texto corrido; escala tipográfica modular.

### Requirement: Superfícies dark e light
O sistema SHALL prover tema **dark** e **light** via tokens (`--bg`, `--surface`, `--text`, `--muted`),
com contraste AA em ambos, respeitando `prefers-color-scheme` e com toggle manual persistido.

#### Scenario: Alternar tema manualmente
- **WHEN** o usuário alterna o tema no toggle manual
- **THEN** as superfícies SHALL mudar via tokens e a escolha SHALL persistir entre recarregamentos

**UI & Aesthetic Contract**

- Contraste mínimo AA em ambos os temas.
- Nota de conflito (§1): a página uol.com.br é apenas light; dark é **obrigatório** por §5.4 e prevalece como convenção.

### Requirement: Micro-interações de feedback
A UI SHALL aplicar `active:scale-95` em botões/cards e `animate-ping` em indicadores "ao vivo"/presença.

#### Scenario: Indicador de conteúdo ao vivo
- **WHEN** a UI exibe um selo "AO VIVO" ou indicador de presença
- **THEN** o elemento SHALL usar `animate-ping`, e controles clicáveis SHALL ter `active:scale-95`

**UI & Aesthetic Contract**

- Transição de cor/opacidade em hover de links e chips.

### Requirement: Anti-AI-slop e créditos
O sistema SHALL evitar padrões anti-AI-slop e SHALL exibir créditos com a fonte visual **baseado em uol.com.br**.

#### Scenario: Rodapé de créditos
- **WHEN** o usuário visualiza o rodapé
- **THEN** SHALL constar o crédito da sprint e "baseado em uol.com.br", sem emoji e sem quebra de marca

**UI & Aesthetic Contract**

- Proibido: gradiente roxo/azul genérico, emoji decorativo, glassmorphism sem propósito, copy vaga, lorem ipsum visível.
