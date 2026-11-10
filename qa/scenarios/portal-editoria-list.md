# Cenário 4.2 — Listagem por editoria + estados `loading`/`erro`/`vazio`

**Spec:** `portal-editorias` › "Lista de editorias"/"Navegação por editoria" · `portal-articles` › "Listagem de artigos por editoria"/"Limite default da listagem".
**Track:** D. **Pré-condição:** API em `:3001`.

## Passos

1. `GET /api/portal/editorias`.
2. `GET /api/portal/articles` (sem `limit`).
3. `GET /api/portal/articles?editoria=esportes`.
4. Abrir a tela `Editoria` (`/editoria/esportes`).

## Critérios de aceite

| # | Verificação | Esperado |
| - | ----------- | -------- |
| 1 | Editorias | `id`, `name`, `slug`, `color` |
| 2 | Limite default | sem `limit` → no máximo **10** artigos |
| 3 | Filtro | `editoria=esportes` só devolve `esportes` |
| 4 | Forma de Article | `id`, `title`, `summary`, `editoria`, `publishedAt`, `imageUrl`, `url` |
| 5 | `publishedAt` na UI | renderizado em JetBrains Mono |
| 6 | Estados (§4.3) | `loading` = skeleton/spinner; `erro` = mensagem + "tentar novamente"; `vazio` = estado dedicado |

## Evidência esperada

`node qa/scripts/portal-smoke.mjs` valida os critérios 1–4. Os estados de UI (5–6) são garantidos por `frontend/src/components/StateViews.tsx` e pelas telas `HomePage`/`EditoriaPage`.
