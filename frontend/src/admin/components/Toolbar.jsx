import { useId, useState } from 'react';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch, IconX } from '@tabler/icons-react';

/**
 * Debounced search box. The URL value is the source of truth: when it changes
 * from outside (back button, "clear filters") the draft follows it.
 */
export function SearchBox({ value, onChange, placeholder = 'Search', label = 'Search', delay = 350 }) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }
  const send = useDebouncedCallback((next) => onChange(next.trim()), delay);

  const change = (next) => {
    setDraft(next);
    send(next);
  };

  return (
    <div className="admin-search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <IconSearch size={16} stroke={1.75} aria-hidden="true" className="admin-search__icon" />
      <input
        id={id}
        type="search"
        className="admin-search__input"
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => change(event.target.value)}
      />
      {draft && (
        <button
          type="button"
          className="admin-search__clear"
          aria-label="Clear search"
          onClick={() => {
            setDraft('');
            onChange('');
          }}
        >
          <IconX size={14} stroke={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** Native <select> filter: fast, mobile friendly and accessible by default. */
export function FilterSelect({ label, value, onChange, options, allLabel }) {
  const id = useId();
  return (
    <div className="admin-filter">
      <label htmlFor={id} className="admin-filter__label">
        {label}
      </label>
      <select id={id} className="admin-filter__control" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{allLabel ?? `All`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterDate({ label, value, onChange, min, max }) {
  const id = useId();
  return (
    <div className="admin-filter">
      <label htmlFor={id} className="admin-filter__label">
        {label}
      </label>
      <input
        id={id}
        type="date"
        className="admin-filter__control"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Wrapper that lays the controls out on one wrapping row. */
export function Toolbar({ children, end }) {
  return (
    <div className="admin-toolbar" role="search">
      <div className="admin-toolbar__controls">{children}</div>
      {end && <div className="admin-toolbar__end">{end}</div>}
    </div>
  );
}
