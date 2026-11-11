import { Link, NavLink } from 'react-router-dom';
import type { Editoria } from '@uol/shared';
import { useFetch } from '../lib/useFetch';
import { editoriaColorVar, editoriaPath } from '../lib/editorias';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

/** Classe-base do item do menu horizontal (padrão de divisores do uol.com.br, §1). */
const navItemClass =
  'inline-flex items-center py-1 text-sm font-bold text-content no-underline ' +
  'transition-colors hover:text-brand-red hover:underline active:scale-95';

/**
 * Header mini enxuto (§3.1): logo + busca + menu horizontal de editorias
 * estilo uol.com.br (links de texto com divisores finos) + atalho "Flash".
 */
export function Header() {
  const { data: editorias } = useFetch<Editoria[]>('/api/portal/editorias');

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="h-2 w-2 animate-ping rounded-full bg-brand-red" aria-hidden="true" />
            <span className="text-lg font-extrabold tracking-tight text-ink">
              UOL <span className="text-brand-red">mini portal</span>
            </span>
          </Link>
          <div className="ml-auto hidden w-72 sm:block">
            <SearchBar />
          </div>
          <ThemeToggle />
        </div>

        <div className="sm:hidden">
          <SearchBar />
        </div>

        <nav aria-label="Editorias" className="-mx-1 flex flex-wrap items-stretch gap-y-1">
          {editorias?.map((e, i) => (
            <NavLink
              key={e.slug}
              to={editoriaPath(e.slug)}
              className={`${navItemClass} px-3 ${i === 0 ? 'pl-1' : 'border-l border-border'}`}
              style={({ isActive }) =>
                isActive
                  ? {
                      color: editoriaColorVar(e.slug),
                      textDecoration: 'underline',
                      textUnderlineOffset: 4,
                    }
                  : undefined
              }
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: editoriaColorVar(e.slug) }}
              />
              {e.name}
            </NavLink>
          ))}
          <NavLink
            to="/flash"
            className={`${navItemClass} px-3 font-extrabold text-brand-red ${
              editorias && editorias.length > 0 ? 'border-l border-border' : 'pl-1'
            }`}
            aria-label="Ir para o UOL Flash"
          >
            Flash
          </NavLink>
          <NavLink
            to="/bate-papo"
            className={`${navItemClass} border-l border-border px-3 font-extrabold text-brand-red`}
            aria-label="Ir para o Bate-Papo UOL"
          >
            Bate-Papo
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
