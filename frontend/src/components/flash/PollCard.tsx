import type { Poll, Short } from '@uol/shared';
import { editoriaColorVar } from '../../lib/editorias';

/**
 * Enquete interativa sobre a mídia (§3.2 / spec `flash-frontend-core`):
 * - voto via `POST /vote` com dedup por browser (1 voto por short);
 * - após votar, barras de percentual na cor da editoria com contraste AA;
 * - resultado em `aria-live="polite"` apenas no card visível (`active`).
 */
export function PollCard({
  short,
  active,
  votedOptionId,
  onVote,
}: {
  short: Short;
  active: boolean;
  votedOptionId: string | null;
  onVote: (short: Short, optionId: string) => void;
}) {
  const poll: Poll | undefined = short.poll;
  if (!poll) return null;

  const voted = votedOptionId !== null;
  const total = poll.totalVotes;

  return (
    <section
      aria-label={`Enquete: ${poll.question}`}
      className="pointer-events-auto w-full max-w-[19rem] rounded-sm bg-black/70 p-3"
    >
      <p className="m-0 text-xs font-bold text-white">{poll.question}</p>

      {voted ? (
        <div
          aria-live={active ? 'polite' : 'off'}
          className="mt-2 flex flex-col gap-1.5"
        >
          {poll.options.map((option) => {
            const percent = total > 0 ? Math.round((option.votes / total) * 100) : 0;
            return (
              <div key={option.id}>
                <div className="flex items-baseline justify-between gap-2 text-xs text-white">
                  <span className="truncate font-semibold">{option.label}</span>
                  <span className="font-telemetry shrink-0">{percent}%</span>
                </div>
                <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: editoriaColorVar(short.editoria),
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p className="m-0 mt-1 text-[11px] text-white/80">
            <span className="font-telemetry">{total}</span> voto{total === 1 ? '' : 's'}
            no total
          </p>
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5">
          {poll.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onVote(short, option.id)}
              aria-label={`Votar em: ${option.label}`}
              className="w-full rounded-full border border-white/70 bg-white/10 px-3 py-1.5 text-left text-xs font-semibold text-white transition-colors hover:bg-white/25 active:scale-95"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
