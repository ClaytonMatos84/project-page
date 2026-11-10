import { useTheme } from '../lib/useTheme';

/**
 * Toggle manual de tema persistido (§5.4).
 * Feedback de clique `active:scale-95` (§5.5) e estado acessível por teclado.
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-content transition-colors hover:text-brand-blue active:scale-95"
    >
      <span aria-hidden="true" className="text-sm">
        {isDark ? '☀' : '☾'}
      </span>
    </button>
  );
}
