## 1. Contrato e shared

- [x] 1.1 [PARALLEL TRACK-A] Validar `openspec validate uol-foundation --strict` sem avisos.
- [x] 1.2 [PARALLEL TRACK-A] Publicar tipos do envelope (`Envelope<T>`, `ApiError`) e entidades base em `shared/` (somente leitura para B/C).

## 2. Backend / API

- [x] 2.1 [PARALLEL TRACK-B] Middleware de envelope `{ data, meta }` com `latencyMs` inteiro, `contract: v1`, `traceId` e `ts` ISO.
- [x] 2.2 [PARALLEL TRACK-B] Handler de erro padronizado `400/404/500` com `data: null`, `error.code`/`error.message` e `latencyMs` presente.
- [x] 2.3 [PARALLEL TRACK-B] Endpoint `GET /health` com `status`, `uptimeMs`, `version`.
- [x] 2.4 [PARALLEL TRACK-B] CORS liberado (`Access-Control-Allow-Origin: *`) e `Content-Type: application/json; charset=utf-8`.

## 3. Frontend / Design tokens

- [x] 3.1 [PARALLEL TRACK-C] CSS custom properties de marca, editorias e superfícies (`--bg`, `--surface`, `--text`, `--muted`) + config Tailwind.
- [x] 3.2 [PARALLEL TRACK-C] Tema dark/light ativo na v1: `prefers-color-scheme` + toggle manual persistido.
- [x] 3.3 [PARALLEL TRACK-C] Fontes Inter e JetBrains Mono; utilitário de telemetria em mono.
- [x] 3.4 [PARALLEL TRACK-C] Rodapé de créditos "baseado em uol.com.br" sem emoji.
- [x] 3.5 [PARALLEL TRACK-C] Utilitários de micro-interação (`active:scale-95`, `animate-ping`) e regra amarelo↔texto preto.

## 4. QA / Demo

- [x] 4.1 [PARALLEL TRACK-D] Cenário: envelope `{ data, meta }` + `latencyMs` em sucesso e em erro.
- [x] 4.2 [PARALLEL TRACK-D] Cenário: contraste AA em dark e light, incluindo `#FFCE00` com texto preto.
- [x] 4.3 [PARALLEL TRACK-D] Cenário: `/health` respondendo e `404` no formato padrão com `data: null`.
