import { useState, type FormEvent } from 'react';
import type { Short } from '@uol/shared';
import { apiFetch, ApiError } from '../../lib/api';
import { useDialog } from '../../lib/useDialog';
import { CloseIcon } from './Icons';

/** Os 5 slugs canônicos (§5.2) — espelham o `400` do contrato. */
const CANONICAL_EDITORIAS = ['noticias', 'esportes', 'economia', 'entretenimento', 'tecnologia'] as const;
const MEDIA_TYPES = ['image', 'video'] as const;
const HTTP_URL = /^https?:\/\/\S+$/i;

interface FieldErrors {
  title?: string;
  body?: string;
  editoria?: string;
  mediaUrl?: string;
  mediaType?: string;
  articleUrl?: string;
  pollQuestion?: string;
  pollOptions?: string;
}

/**
 * Validação client-side espelhando o `400` do contrato (spec `flash-shorts`):
 * title 1–120, body 1–500, editoria canônica, mediaUrl http(s), mediaType enum,
 * articleUrl http(s) opcional, poll opcional (question 1–120 + 2–4 opções).
 */
function validate(form: {
  title: string;
  body: string;
  editoria: string;
  mediaUrl: string;
  mediaType: string;
  articleUrl: string;
  pollQuestion: string;
  pollOptions: string[];
}): FieldErrors {
  const errors: FieldErrors = {};
  const title = form.title.trim();
  if (title.length < 1 || title.length > 120) {
    errors.title = 'O título deve ter entre 1 e 120 caracteres.';
  }
  const body = form.body.trim();
  if (body.length < 1 || body.length > 500) {
    errors.body = 'O resumo deve ter entre 1 e 500 caracteres.';
  }
  if (!(CANONICAL_EDITORIAS as readonly string[]).includes(form.editoria)) {
    errors.editoria = 'Escolha uma das 5 editorias canônicas.';
  }
  if (!HTTP_URL.test(form.mediaUrl.trim())) {
    errors.mediaUrl = 'A URL da mídia deve começar com http:// ou https://.';
  }
  if (!(MEDIA_TYPES as readonly string[]).includes(form.mediaType)) {
    errors.mediaType = 'Escolha image ou video.';
  }
  const articleUrl = form.articleUrl.trim();
  if (articleUrl !== '' && !HTTP_URL.test(articleUrl)) {
    errors.articleUrl = 'A URL da matéria deve começar com http:// ou https://.';
  }

  const options = form.pollOptions.map((o) => o.trim());
  const pollTouched = form.pollQuestion.trim() !== '' || options.some((o) => o !== '');
  if (pollTouched) {
    const question = form.pollQuestion.trim();
    if (question.length < 1 || question.length > 120) {
      errors.pollQuestion = 'A pergunta da enquete deve ter entre 1 e 120 caracteres.';
    }
    const filled = options.filter((o) => o !== '');
    if (filled.length < 2 || filled.length > 4 || filled.length !== options.length) {
      errors.pollOptions = 'A enquete precisa de 2 a 4 opções, todas preenchidas.';
    }
  }
  return errors;
}

const inputClass =
  'w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-content placeholder:text-muted focus:border-brand-blue';

/**
 * Modal de publicação de short (spec `flash-frontend-core`): campos do
 * contrato, validação client-side espelhando o `400`, erro do servidor exibido
 * (nunca engolido), sucesso → fecha + toast + short no topo do feed.
 */
export function PublishModal({
  open,
  onClose,
  onPublished,
}: {
  open: boolean;
  onClose: () => void;
  onPublished: (created: Short) => void;
}) {
  const dialogRef = useDialog(open, onClose);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editoria, setEditoria] = useState<string>('noticias');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<string>('image');
  const [articleUrl, setArticleUrl] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const setOption = (index: number, value: string): void => {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setServerError(null);

    const fieldErrors = validate({ title, body, editoria, mediaUrl, mediaType, articleUrl, pollQuestion, pollOptions });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const options = pollOptions.map((o) => o.trim());
    const includePoll = pollQuestion.trim() !== '' || options.some((o) => o !== '');

    void (async () => {
      setSubmitting(true);
      try {
        const created = await apiFetch<Short>('/api/flash/shorts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim(),
            editoria,
            mediaUrl: mediaUrl.trim(),
            mediaType,
            ...(articleUrl.trim() !== '' ? { articleUrl: articleUrl.trim() } : {}),
            ...(includePoll ? { poll: { question: pollQuestion.trim(), options } } : {}),
          }),
        });
        setTitle('');
        setBody('');
        setMediaUrl('');
        setArticleUrl('');
        setPollQuestion('');
        setPollOptions(['', '']);
        setErrors({});
        onPublished(created);
      } catch (err) {
        // Erro do servidor exibido com clareza, nunca engolido (§2.3).
        const message =
          err instanceof ApiError ? err.message : 'Não foi possível publicar o short.';
        setServerError(message);
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-md border border-border bg-surface p-5 text-content shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="publish-title" className="m-0 text-lg font-extrabold text-ink">
            Publicar novo short
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar publicação"
            className="rounded-full p-1.5 text-muted transition-colors hover:text-content active:scale-95"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="pub-title" className="text-sm font-bold text-ink">
              Título
            </label>
            <input
              id="pub-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className={inputClass}
              aria-describedby={errors.title ? 'pub-title-err' : undefined}
            />
            {errors.title && (
              <p id="pub-title-err" className="m-0 mt-1 text-xs font-semibold text-brand-red">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pub-body" className="text-sm font-bold text-ink">
              Resumo
            </label>
            <textarea
              id="pub-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={3}
              className={inputClass}
              aria-describedby={errors.body ? 'pub-body-err' : undefined}
            />
            {errors.body && (
              <p id="pub-body-err" className="m-0 mt-1 text-xs font-semibold text-brand-red">
                {errors.body}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="pub-editoria" className="text-sm font-bold text-ink">
                Editoria
              </label>
              <select
                id="pub-editoria"
                value={editoria}
                onChange={(e) => setEditoria(e.target.value)}
                className={inputClass}
              >
                {CANONICAL_EDITORIAS.map((slug) => (
                  <option key={slug} value={slug}>
                    {slug}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="pub-mediatype" className="text-sm font-bold text-ink">
                Tipo de mídia
              </label>
              <select
                id="pub-mediatype"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className={inputClass}
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="pub-mediaurl" className="text-sm font-bold text-ink">
              URL da mídia vertical
            </label>
            <input
              id="pub-mediaurl"
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              className={inputClass}
              aria-describedby={errors.mediaUrl ? 'pub-mediaurl-err' : undefined}
            />
            {errors.mediaUrl && (
              <p id="pub-mediaurl-err" className="m-0 mt-1 text-xs font-semibold text-brand-red">
                {errors.mediaUrl}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pub-articleurl" className="text-sm font-bold text-ink">
              URL da matéria completa (opcional)
            </label>
            <input
              id="pub-articleurl"
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://uol.com.br/..."
              className={inputClass}
              aria-describedby={errors.articleUrl ? 'pub-articleurl-err' : undefined}
            />
            {errors.articleUrl && (
              <p id="pub-articleurl-err" className="m-0 mt-1 text-xs font-semibold text-brand-red">
                {errors.articleUrl}
              </p>
            )}
          </div>

          <fieldset className="m-0 rounded-sm border border-border p-3">
            <legend className="px-1 text-sm font-bold text-ink">Enquete (opcional)</legend>
            <label htmlFor="pub-pollq" className="text-xs font-semibold text-muted">
              Pergunta
            </label>
            <input
              id="pub-pollq"
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              maxLength={120}
              className={inputClass}
              aria-describedby={errors.pollQuestion ? 'pub-pollq-err' : undefined}
            />
            {errors.pollQuestion && (
              <p id="pub-pollq-err" className="m-0 mt-1 text-xs font-semibold text-brand-red">
                {errors.pollQuestion}
              </p>
            )}

            <div className="mt-2 flex flex-col gap-2">
              {pollOptions.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => setOption(i, e.target.value)}
                    aria-label={`Opção ${i + 1} da enquete`}
                    className={inputClass}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={`Remover opção ${i + 1}`}
                      className="shrink-0 rounded-full p-1.5 text-muted transition-colors hover:text-brand-red active:scale-95"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.pollOptions && (
              <p className="m-0 mt-1 text-xs font-semibold text-brand-red">{errors.pollOptions}</p>
            )}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={() => setPollOptions((prev) => [...prev, ''])}
                className="mt-2 rounded-full border border-border px-3 py-1 text-xs font-bold text-content transition-colors hover:border-brand-blue active:scale-95"
              >
                Adicionar opção
              </button>
            )}
          </fieldset>

          {serverError && (
            <p role="alert" className="m-0 rounded-sm bg-brand-red/10 p-2 text-sm font-semibold text-brand-red">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Publicando…' : 'Publicar short'}
          </button>
        </form>
      </div>
    </div>
  );
}
