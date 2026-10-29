import { Pagination } from '@mantine/core';

/**
 * Pagination bound to the API's `meta` ({ current_page, last_page, total, per_page }).
 * Renders nothing for a single page.
 */
export function Pager({ meta, onChange, label = 'results' }) {
  if (!meta || meta.last_page <= 1) return null;
  const from = (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <nav className="pager-bar" aria-label="Pagination">
      <p className="pager-bar__summary">
        Showing <strong>{from}–{to}</strong> of <strong>{meta.total}</strong> {label}
      </p>
      <Pagination total={meta.last_page} value={meta.current_page} onChange={onChange} siblings={1} withEdges getControlProps={(control) => ({ 'aria-label': `Go to ${control} page` })} />
    </nav>
  );
}
