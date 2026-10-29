/** Label / value pairs for detail views. Empty values render an em dash so rows never collapse. */
export function DefinitionList({ items, columns = 2 }) {
  return (
    <dl className={`admin-dl admin-dl--${columns}`}>
      {items
        .filter((item) => item && !item.hidden)
        .map(({ label, value, wide }) => (
          <div key={label} className={`admin-dl__row${wide ? ' is-wide' : ''}`}>
            <dt className="admin-dl__term">{label}</dt>
            <dd className="admin-dl__value">{value === null || value === undefined || value === '' ? <span className="admin-dl__empty">—</span> : value}</dd>
          </div>
        ))}
    </dl>
  );
}
