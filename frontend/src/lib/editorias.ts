import type { EditoriaSlug } from '@uol/shared';

/**
 * Ponte entre a editoria do contrato e o token do Design System (§5.2).
 * Slug da editoria == sufixo do token `--ed-<slug>`.
 */
export function editoriaColorVar(slug: EditoriaSlug | string): string {
  return `var(--ed-${slug})`;
}

/** Rota canônica da tela `Editoria` para um slug. */
export function editoriaPath(slug: EditoriaSlug | string): string {
  return `/editoria/${slug}`;
}

/**
 * Cor de texto AA sobre o fundo sólido de uma editoria (§5.1/§5.2, A CRITÉRIO).
 * O laranja de Entretenimento é claro: usa texto **preto**; as demais, branco.
 */
export function editoriaOnColor(slug: EditoriaSlug | string): string {
  return slug === 'entretenimento' ? '#000000' : '#ffffff';
}
