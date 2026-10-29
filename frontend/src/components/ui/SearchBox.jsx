import { useId } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { cx } from '@/lib/cx';

/**
 * Search field with icon + clear button. Fully controlled (`value`, `onChange(text)`);
 * the parent debounces. Wrapped in role="search".
 */
export function SearchBox({ value, onChange, label = 'Search', placeholder = 'Search…', className }) {
  const id = useId();
  return (
    <form className={cx('search-box', className)} role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <IconSearch className="search-box__icon" size={20} stroke={1.75} aria-hidden="true" />
      <input
        id={id}
        className="search-box__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
      />
      {value && (
        <button type="button" className="search-box__clear" onClick={() => onChange('')} aria-label="Clear search">
          <IconX size={16} stroke={2} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
