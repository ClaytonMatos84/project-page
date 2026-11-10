## Context

A sprint UOL (§8) exige um contrato congelado antes de qualquer código de produto (Fase 1 é *gate*).
Esta change estabelece as duas fundações cross-cutting: a **convenção de API** (§4.1) e os **tokens do
Design System** (§5). Ela vence por precedência de processo (§1): prevalece sobre preferências de agente
e sobre o código, e materializa a identidade da página uol.com.br.

Restrições: sistema em duas portas (`:3000` frontend, `:3001` API), persistência em memória, contrato
imutável após aprovação, TypeScript em B/C, `shared/` somente leitura.

## Goals / Non-Goals

**Goals**
- Um único envelope de resposta e um único formato de erro, aplicados por middleware (DRY, sem repetição por handler).
- Telemetria de latência confiável (medida no handler, não estimada).
- Tokens de design prontos para dark/light e para a paleta de editorias.

**Non-Goals**
- Nenhum endpoint de produto (isso é do `mini-portal-uol`).
- Nenhuma regra de negócio, seed ou UI de tela.

## Decisions

- **Middleware de envelope, não boilerplate por rota.** Um wrapper `sendEnvelope(res, data, start)` mede `latencyMs = Date.now() - start`. Alternativa (cada handler monta o JSON) foi rejeitada por duplicação e risco de esquecer `meta`.
- **`latencyMs` inteiro sempre presente**, inclusive em erro: o handler de erro reusa o mesmo wrapper com `data: null`. Alternativa (só em sucesso) viola §4.1.
- **`meta.contract` como constante `v1`** centralizada em `shared/`. `meta.ts` (ISO 8601) entra como recomendado; `meta.traceId` é **incluído em toda resposta** (decisão do usuário), inclusive em erro, para correlação.
- **Tokens via CSS custom properties** (`--uol-*`, `--ed-*`, `--bg`/`--surface`/`--text`/`--muted`) consumidas pelo Tailwind. Alternativa (hex hardcoded nos componentes) viola a ponte página↔código (§1) e a consistência de editoria (§5.2).
- **Dark/light ativo na v1.** A página uol.com.br é apenas light, mas §5.4 torna dark+light **OBRIGATÓRIO**; tratado como conflito de **convenção** (§1: processo vence) e registrado no relatório §9.

## Risks / Trade-offs

- [Token e página divergem de matiz] → Ajustar matiz mantendo a família de marca (§5.2 A CRITÉRIO) e documentar.
- [Middleware engolir erro e responder 200] → Handler de erro dedicado + teste de contrato `404/500`.
- [`shared/` virar ponto de acoplamento entre tracks] → Somente leitura para B/C; mudança de tipo exige nova spec.
- [Dark/light obrigatório vs página light gerar retrabalho] → Já entra na v1 (decisão do usuário), evitando retrofit.

## Migration Plan

Não há migração: base inicial, sem endpoints prévios. Rollback = remover a change (nada a desfazer em produção).

## Open Questions

- Nenhuma em aberto. Resolvidas: `meta.traceId` incluído na v1; paleta de editorias fixada nas **cinco** do §5.2.
