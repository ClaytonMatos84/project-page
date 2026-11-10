import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { CreditsFooter } from './CreditsFooter';

/** Shell da aplicação: header mini + conteúdo roteado + rodapé de créditos. */
export function Layout() {
  return (
    <div className="flex min-h-full flex-col bg-bg text-content">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <CreditsFooter />
    </div>
  );
}
