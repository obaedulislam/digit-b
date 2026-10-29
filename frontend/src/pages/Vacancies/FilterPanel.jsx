import { useId, useState } from 'react';
import { Skeleton } from '@mantine/core';
import { FACETS } from './filters';

const COLLAPSED_COUNT = 6;

function FacetGroup({ label, name, options, value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const selectedHidden = options.findIndex((o) => String(o.value) === String(value)) >= COLLAPSED_COUNT;
  const showAll = expanded || selectedHidden || options.length <= COLLAPSED_COUNT + 1;
  const visible = showAll ? options : options.slice(0, COLLAPSED_COUNT);

  return (
    <fieldset className="facet">
      <legend className="facet__legend">{label}</legend>
      <ul className="facet__list">
        <li>
          <label className="facet__option">
            <input className="facet__input" type="radio" name={name} checked={!value} onChange={() => onChange('')} />
            <span className="facet__dot" aria-hidden="true" />
            <span className="facet__label">Any</span>
          </label>
        </li>
        {visible.map((option) => (
          <li key={option.value}>
            <label className="facet__option">
              <input
                className="facet__input"
                type="radio"
                name={name}
                checked={String(option.value) === String(value)}
                onChange={() => onChange(String(option.value))}
              />
              <span className="facet__dot" aria-hidden="true" />
              <span className="facet__label">{option.label}</span>
              {option.count !== undefined && <span className="facet__count">{option.count}</span>}
            </label>
          </li>
        ))}
      </ul>
      {!showAll && (
        <button type="button" className="link-button facet__more" onClick={() => setExpanded(true)}>
          Show all {options.length}
        </button>
      )}
    </fieldset>
  );
}

/**
 * Facet filters driven by `queries.jobFilters()`. Radio-style (one value per
 * facet, as the API accepts a single value), with live counts.
 */
export function FilterPanel({ facets, state, onChange, loading = false, error = false, onRetry }) {
  const prefix = useId();

  if (loading) {
    return (
      <div className="filter-panel" aria-busy="true" aria-label="Loading filters">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={120} radius="md" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <p className="filter-panel__error">
        Filters are unavailable right now.{' '}
        <button type="button" className="link-button" onClick={onRetry}>
          Retry
        </button>
      </p>
    );
  }

  return (
    <div className="filter-panel">
      {FACETS.map(({ key, facet, label }) => {
        const options = facets?.[facet] ?? [];
        if (!options.length && !state[key]) return null;
        const withActive =
          state[key] && !options.some((o) => String(o.value) === String(state[key]))
            ? [{ value: state[key], label: state[key] }, ...options]
            : options;
        return <FacetGroup key={key} label={label} name={`${prefix}-${key}`} options={withActive} value={state[key]} onChange={(next) => onChange(key, next)} />;
      })}
    </div>
  );
}
