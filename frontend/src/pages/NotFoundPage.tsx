import { Link } from 'react-router-dom';
import { EmptyState } from '../components/StateViews';

/** Rota inexistente — estado dedicado com orientação (§4.3). */
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-4">
      <EmptyState title="Página não encontrada" hint="O endereço acessado não existe neste portal." />
      <Link
        to="/"
        className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white no-underline transition-colors hover:bg-brand-red-dark active:scale-95"
      >
        Voltar para a home
      </Link>
    </div>
  );
}
