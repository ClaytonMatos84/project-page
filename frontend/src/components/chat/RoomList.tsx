import type { Room } from '@uol/shared';

/**
 * Coluna esquerda (spec `chat-frontend-core`): salas com a barra de lotação
 * clássica — preenchimento amarelo `--uol-yellow`, **vermelho acima de 80%**,
 * contagem "35/40" em JetBrains Mono (§5.3). Sala ativa destacada na `color`
 * da sala; troca rápida de nick (re-enter) na base.
 */
export function RoomList({
  rooms,
  activeRoomId,
  nick,
  onSelectRoom,
  onChangeNick,
}: {
  rooms: Room[];
  activeRoomId: string | null;
  nick: string | null;
  onSelectRoom: (roomId: string) => void;
  onChangeNick: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rooms.map((room) => {
          const active = room.id === activeRoomId;
          const fill = Math.min(100, Math.round((room.online / room.capacity) * 100));
          const crowded = fill > 80;
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onSelectRoom(room.id)}
                aria-pressed={active}
                className={`w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-left transition-colors active:scale-95 ${
                  active ? 'border-l-4' : 'hover:border-brand-blue'
                }`}
                style={active ? { borderLeftColor: room.color } : undefined}
              >
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm ${active ? 'font-extrabold text-ink' : 'font-semibold text-content'}`}
                  >
                    {room.name}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {room.online}/{room.capacity}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 block h-1.5 w-full overflow-hidden rounded-xs bg-surface-2"
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

      <div className="rounded-sm border border-border bg-surface p-3">
        <p className="m-0 text-xs uppercase tracking-wide text-muted">seu apelido</p>
        <p className="m-0 mt-0.5 truncate text-sm font-bold text-ink">
          {nick ?? 'não conectado'}
        </p>
        <button
          type="button"
          onClick={onChangeNick}
          className="mt-2 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-content transition-colors hover:border-brand-blue active:scale-95"
        >
          {nick ? 'trocar apelido' : 'entrar com apelido'}
        </button>
      </div>
    </div>
  );
}
