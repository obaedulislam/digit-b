import { useId, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { addTags, removeTag } from '@/lib/tags';
import { cx } from '@/lib/cx';

/**
 * Tag-style input (skills). Enter / comma / blur commits the typed text,
 * pasting "a, b, c" splits it, Backspace on an empty field removes the last tag.
 * Controlled: `value` is a string[]; `error` is shown under the control.
 */
export function TagInput({ label, description, error, value = [], onChange, max = 15, maxLength = 40, placeholder, id, className }) {
  const autoId = useId();
  const inputId = id || `tags-${autoId}`;
  const [draft, setDraft] = useState('');
  const limitReached = value.length >= max;

  const commit = (raw = draft) => {
    if (raw.trim()) onChange(addTags(value, raw, { max, maxLength }));
    setDraft('');
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(removeTag(value, value.length - 1));
    }
  };

  const onPaste = (event) => {
    const text = event.clipboardData.getData('text');
    if (/[,\n;]/.test(text)) {
      event.preventDefault();
      commit(`${draft}${text}`);
    }
  };

  return (
    <div className={cx('field', 'tag-field', className)}>
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className={cx('tag-input', error && 'is-invalid')}>
        {value.length > 0 && (
          <ul className="tag-input__list" aria-label="Added skills">
            {value.map((tag, index) => (
              <li key={tag} className="tag-input__tag">
                <span>{tag}</span>
                <button type="button" className="tag-input__remove" onClick={() => onChange(removeTag(value, index))} aria-label={`Remove ${tag}`}>
                  <IconX size={12} stroke={2.5} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          id={inputId}
          className="tag-input__field"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => commit()}
          placeholder={limitReached ? `Maximum of ${max} reached` : value.length ? 'Add another…' : placeholder}
          disabled={limitReached}
          maxLength={maxLength * 4}
          autoComplete="off"
          aria-describedby={error ? `${inputId}-error` : description ? `${inputId}-hint` : undefined}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {error ? (
        <p className="field__error" id={`${inputId}-error`}>
          {error}
        </p>
      ) : (
        description && (
          <p className="field__hint" id={`${inputId}-hint`}>
            {description} <span className="tag-input__count">{value.length}/{max}</span>
          </p>
        )
      )}
    </div>
  );
}
