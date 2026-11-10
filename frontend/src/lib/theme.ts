export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'uol-theme';

/** Lê a preferência persistida, validando o valor. */
export function readStoredTheme(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* localStorage indisponível (ex.: modo privado) — cai no default */
  }
  return 'system';
}

/** Persiste a preferência de tema. */
export function storeTheme(pref: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* sem persistência disponível — segue em memória */
  }
}

/** Resolve a preferência em tema efetivo ('system' segue prefers-color-scheme). */
export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'light' || pref === 'dark') return pref;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Aplica o tema ao documento.
 * - 'system': remove o atributo, deixando o `prefers-color-scheme` do CSS agir.
 * - 'light'/'dark': fixa `data-theme` (override manual persistido).
 */
export function applyTheme(pref: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  if (pref === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', pref);
  }
  root.style.colorScheme = resolved;
  return resolved;
}

/** Inicializa o tema a partir do storage — chamar antes do primeiro render. */
export function initTheme(): ResolvedTheme {
  return applyTheme(readStoredTheme());
}
