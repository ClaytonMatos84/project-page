# `shared/` — Contrato do sistema (Track A)

Tipos do contrato compartilhados entre as tracks. **SOMENTE LEITURA para as tracks B/C.**

- `contract.ts` — envelope `{ data, meta }`, telemetria (`latencyMs`, `contract`, `traceId`, `ts`),
  erros (`ApiError`, `ApiErrorCode`) e `CONTRACT_VERSION`.
- `entities.ts` — entidades base (`Article`, `Editoria`, `Room`, …).

> Alterar qualquer tipo aqui exige **nova spec** aprovada pelo `@spec-architect` (§2.2).
