/**
 * Rodapé de créditos (§5.6) — sprint UOL, baseado em uol.com.br.
 * Sem emoji; sem quebra de marca.
 */
export function CreditsFooter() {
  return (
    <footer className="border-t border-border bg-surface-2 px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 text-xs text-muted">
        <p className="m-0">
          Sprint UOL — Frontend &amp; Backend. Layout e identidade visual baseados em{' '}
          <span className="font-telemetry">uol.com.br</span>.
        </p>
        <p className="m-0 font-telemetry">contrato v1 · foundation</p>
      </div>
    </footer>
  );
}
