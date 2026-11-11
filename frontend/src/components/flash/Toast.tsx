import { useEffect, useRef } from 'react';

/**
 * Toast não bloqueante (§4.3): `role="status"` (implícito `aria-live="polite"`),
 * some sozinho após 3s. Sem emoji (§5.6).
 *
 * O `onDismiss` fica em ref para o timer depender **só** de `message`: call sites
 * que re-renderizam por polling (ex.: Bate-Papo a cada 3s) recriam o callback a
 * cada render; usá-lo como dep reiniciava o `setTimeout` a cada tick e o toast
 * nunca desaparecia.
 */
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const id = setTimeout(() => onDismissRef.current(), 3000);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg shadow-lg"
    >
      {message}
    </div>
  );
}
