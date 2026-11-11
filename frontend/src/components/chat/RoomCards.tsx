import type { Room } from '@uol/shared';

/**
 * Tela inicial do `/bate-papo` (spec `chat-frontend-core` › "Tela inicial com
 * seleção de sala"): cards das salas com nome, tópico e contagem `online/capacity`
 * em JetBrains Mono (§5.3). A seleção é explícita — nenhuma sala é escolhida
 * automaticamente; o clique com `active:scale-95` abre o modal de apelido.
 * Reusa a barra de lotação clássica (amarelo, vermelho acima de 80%).
 */
export function RoomCards({
  rooms,
  onSelect,
}: {
  rooms: Room[];
  onSelect: (roomId: string) => void;
}) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
      {rooms.map((room) => {
        const fill = Math.min(100, Math.round((room.online / room.capacity) * 100));
        const crowded = fill > 80;
        return (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onSelect(room.id)}
              aria-label={`entrar na sala ${room.name}`}
              className="flex h-full w-full flex-col gap-2 rounded-sm border border-t-4 border-border bg-surface p-4 text-left transition-colors hover:border-brand-blue active:scale-95"
              style={{ borderTopColor: room.color }}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-base font-extrabold text-ink">{room.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {room.online}/{room.capacity}
                </span>
              </span>
              <span className="text-sm text-content">{room.topic}</span>
              <span
                aria-hidden="true"
                className="mt-1 block h-1.5 w-full overflow-hidden rounded-xs bg-surface-2"
              >
                <span
                  className="block h-full rounded-xs"
                  style={{
                    width: `${fill}%`,
                    background: crowded ? 'var(--uol-red)' : 'var(--uol-yellow)',
                  }}
                />
              </span>
              <span className="sr-only">
                {room.online} de {room.capacity} lugares ocupados
                {crowded ? ', sala quase cheia' : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
