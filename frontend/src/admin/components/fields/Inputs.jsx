import { useId } from 'react';

/** Native datetime-local input styled like the other fields. Value is the raw `YYYY-MM-DDTHH:mm` string. */
export function DateTimeField({ label, description, error, required, type = 'datetime-local', ...rest }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {description && <p className="field__hint admin-field__hint">{description}</p>}
      <div className="field__control">
        <input
          id={id}
          type={type}
          className="field__input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Character counter hint for limited text fields: "120 / 320". */
export function Counter({ value = '', max }) {
  const length = String(value ?? '').length;
  return (
    <span className={`admin-counter${length > max ? ' is-over' : ''}`} aria-hidden="true">
      {length} / {max}
    </span>
  );
}

/** Titled group of fields (a "card" in the form layout). */
export function FormSection({ title, description, children, as: Heading = 'h2' }) {
  return (
    <section className="admin-card">
      {(title || description) && (
        <header className="admin-card__header">
          {title && <Heading className="admin-card__title">{title}</Heading>}
          {description && <p className="admin-card__text">{description}</p>}
        </header>
      )}
      <div className="admin-card__body">{children}</div>
    </section>
  );
}

/**
 * Native <select> with the shared field look. Spread `form.getInputProps(name)` into it.
 * `options`: [{ value, label }]; `placeholder` adds an empty first option.
 */
export function SelectField({ label, description, error, required, options, placeholder, hideLabel = false, ...rest }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'field__label'}>
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {description && <p className="field__hint admin-field__hint">{description}</p>}
      <div className="field__control admin-select">
        <select
          id={id}
          className="field__input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
          value={rest.value ?? ''}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
