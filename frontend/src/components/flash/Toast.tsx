import { useEffect } from 'react';

/**
 * Toast não bloqueante (§4.3): `role="status"` (implícito `aria-live="polite"`),
 * some sozinho após 3s. Sem emoji (§5.6).
 */
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg shadow-lg"
    >
      {message}
    </div>
  );
}
