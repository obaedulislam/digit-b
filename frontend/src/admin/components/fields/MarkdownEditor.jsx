import { useDeferredValue, useId, useRef, useState } from 'react';
import { IconBold, IconCode, IconH2, IconH3, IconItalic, IconLink, IconList, IconListNumbers, IconQuote } from '@tabler/icons-react';
import { Markdown } from '@/components/ui';
import { applyMarkdownFormat } from '../../lib/markdownFormat';

const TOOLS = [
  { kind: 'h2', label: 'Heading 2', Icon: IconH2 },
  { kind: 'h3', label: 'Heading 3', Icon: IconH3 },
  { kind: 'bold', label: 'Bold', Icon: IconBold },
  { kind: 'italic', label: 'Italic', Icon: IconItalic },
  { kind: 'link', label: 'Link', Icon: IconLink },
  { kind: 'ul', label: 'Bulleted list', Icon: IconList },
  { kind: 'ol', label: 'Numbered list', Icon: IconListNumbers },
  { kind: 'quote', label: 'Quote', Icon: IconQuote },
  { kind: 'code', label: 'Inline code', Icon: IconCode },
];

/**
 * Markdown textarea with a toolbar and a live, sanitised preview (the same
 * renderer the public site uses). Side by side on wide screens, Write/Preview
 * tabs on narrow ones.
 */
export function MarkdownEditor({ label, value = '', onChange, onBlur, error, description, required, minRows = 14, placeholder, maxLength }) {
  const id = useId();
  const textarea = useRef(null);
  const [view, setView] = useState('write');
  const preview = useDeferredValue(value);

  const apply = (kind) => {
    const element = textarea.current;
    if (!element) return;
    const result = applyMarkdownFormat(value, element.selectionStart, element.selectionEnd, kind);
    onChange(result.text);
    window.requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(result.start, result.end);
    });
  };

  return (
    <div className="admin-md field" data-view={view}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {description && <p className="field__hint admin-md__hint">{description}</p>}

      <div className="admin-md__bar">
        <div className="admin-md__tools" role="toolbar" aria-label={`${label} formatting`} aria-controls={id}>
          {TOOLS.map(({ kind, label: toolLabel, Icon }) => (
            <button key={kind} type="button" className="admin-icon-btn" aria-label={toolLabel} title={toolLabel} onClick={() => apply(kind)}>
              <Icon size={16} stroke={1.75} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="admin-md__tabs" role="group" aria-label="Editor view">
          {['write', 'preview'].map((tab) => (
            <button key={tab} type="button" className="admin-md__tab" aria-pressed={view === tab} onClick={() => setView(tab)}>
              {tab === 'write' ? 'Write' : 'Preview'}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-md__panes">
        <div className="admin-md__pane admin-md__pane--write">
          <textarea
            id={id}
            ref={textarea}
            className="field__input admin-md__input"
            rows={minRows}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            spellCheck
          />
        </div>
        {/* tabIndex: the pane scrolls, so keyboard-only users must be able to focus it (WCAG 2.1.1). */}
        <div className="admin-md__pane admin-md__pane--preview" role="region" aria-label={`${label} preview`} tabIndex={0}>
          {preview.trim() ? <Markdown source={preview} /> : <p className="admin-md__empty">Nothing to preview yet. Start writing on the left.</p>}
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
