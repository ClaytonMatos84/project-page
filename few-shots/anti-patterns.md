# Anti-patterns — o que NUNCA fazer (checklist rápido)

> Se um artefato contiver qualquer item abaixo, **reporte** com a severidade indicada.
> Base: `AGENTS.md` §2. Fonte da paleta: uol.com.br / Manual da Marca UOL / Brandfetch.

## Cores
- ❌ **BLOCKER** — usar cores fora da paleta: `#0a3d91`, `#ffd400`, `#6f2dbd`, `#8b5cf6`, neon,
  ou qualquer hex "inventado". Só: `#CB0003`, `#ED5709`, `#005FFF`, `#FFCE00` + neutros.
- ❌ **BLOCKER** — texto **branco** sobre `#FFCE00` (amarelo). Premium = **texto preto**.
- ❌ **MAJOR** — mais de um acento competindo na mesma hierarquia (vermelho + azul + laranja como botões).
- ❌ **MAJOR** — usar o amarelo como cor de texto/ícone (contraste baixíssimo).
- ❌ **MINOR** — gradientes coloridos fora da família vermelho→laranja da marca.

## Tipografia
- ❌ **MAJOR** — manchetes fora de Montserrat ou com peso < 700 (perde a voz UOL).
- ❌ **MAJOR** — depender de fonte remota sem `font-display: swap` e sem fallback.
- ❌ **MINOR** — kicker sem `text-transform: uppercase` / `letter-spacing`.
- ❌ **NIT** — `letter-spacing` negativo agressivo (< −1px) em títulos.

## Layout / componentes
- ❌ **MAJOR** — raios/sombras inconsistentes entre telas; sombras pesadas/coloridas.
- ❌ **MINOR** — espaçamentos fora do grid de 5px; densidade apertada ou vazia demais.
- ❌ **MINOR** — múltiplos selos/ícones decorativos competindo (quebra o minimalismo).
- ❌ **MAJOR** — overflow horizontal no mobile; breakpoints quebrados (≤620/≤900).

## Acessibilidade
- ❌ **BLOCKER** — contraste < 4.5:1 em texto normal (ex.: cinza claro sobre branco).
- ❌ **MAJOR** — botão-ícone sem `aria-label`; `alt` ausente; foco não visível.
- ❌ **MAJOR** — animações contínuas (drift/pulse/blink) sem `prefers-reduced-motion`.
- ❌ **MINOR** — alvo de toque < 44px no mobile.

## Código
- ❌ **MAJOR** — `innerHTML` com texto de usuário (XSS no chat) — use `textContent`.
- ❌ **MAJOR** — `eval`/`Function`; timers/`IntersectionObserver` não limpos.
- ❌ **MINOR** — hex solto em vez de `var(--token)`; `!important` desnecessário.
- ❌ **MINOR** — código morto, variáveis não usadas, `console.log` de debug.

## Conteúdo / créditos
- ❌ **MINOR** — placeholders esquecidos (lorem, "TODO", "xxx").
- ❌ **MINOR** — remover a atribuição de que a paleta se baseia em UOL (rodapé/README).
- ❌ **MINOR** — datas/horas fora do padrão BR (DD/MM/AAAA · HHhMM).
