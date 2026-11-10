import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Controle de busca do header mini (§ portal-search).
 * Navega para `/busca?q=<termo>`; foco visível e navegável por teclado.
 */
export function SearchBar() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [term, setTerm] = useState(params.get('q') ?? '');

  useEffect(() => {
    setTerm(params.get('q') ?? '');
  }, [params]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = term.trim();
    navigate(q === '' ? '/busca' : `/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <label htmlFor="portal-search" className="sr-only">
        Buscar no UOL
      </label>
      <input
        id="portal-search"
        type="search"
        name="q"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar no UOL"
        autoComplete="off"
        className="h-9 w-full min-w-0 rounded-full border border-border bg-surface-2 px-4 text-sm text-content placeholder:text-muted focus-visible:outline-none"
      />
      <button
        type="submit"
        className="h-9 shrink-0 rounded-full bg-brand-red px-4 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95"
      >
        Buscar
      </button>
    </form>
  );
}
