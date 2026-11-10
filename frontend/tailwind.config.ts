import type { Config } from 'tailwindcss';

/**
 * Tailwind UOL — expressão técnica da identidade UOL (§1/§5).
 * As cores apontam para os CSS custom properties em `src/styles/tokens.css`,
 * garantindo uma única fonte de verdade (página → token → código).
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: 'var(--uol-red)',
          'red-dark': 'var(--uol-red-dark)',
          orange: 'var(--uol-orange)',
          blue: 'var(--uol-blue)',
          yellow: 'var(--uol-yellow)',
        },
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        ink: 'var(--ink)',
        content: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        ed: {
          noticias: 'var(--ed-noticias)',
          esportes: 'var(--ed-esportes)',
          economia: 'var(--ed-economia)',
          entretenimento: 'var(--ed-entretenimento)',
          tecnologia: 'var(--ed-tecnologia)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
