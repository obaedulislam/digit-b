/**
 * URL <-> list-state mapping for every admin table, so pages are shareable and
 * the back button works. All functions are pure.
 *
 * config: { filters: ['status', 'job'], defaultSort: '-created_at' }
 */

const toPage = (value) => {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

/** URLSearchParams -> `{ page, search, sort, ...filters }`. */
export function readListParams(searchParams, { filters = [], defaultSort = '' } = {}) {
  const state = {
    page: toPage(searchParams.get('page')),
    search: searchParams.get('search') ?? '',
    sort: searchParams.get('sort') || defaultSort,
  };
  filters.forEach((name) => {
    state[name] = searchParams.get(name) ?? '';
  });
  return state;
}

/**
 * Applies a patch to the current search params. Any change other than `page`
 * resets to page 1; empty values and defaults are omitted from the URL.
 * Unknown params (e.g. `?open=12` for a drawer) are preserved.
 */
export function writeListParams(current, patch, { filters = [], defaultSort = '' } = {}) {
  const next = new URLSearchParams(current);
  const keys = Object.keys(patch);
  const known = new Set(['page', 'search', 'sort', ...filters]);

  keys
    .filter((key) => known.has(key))
    .forEach((key) => {
      const value = patch[key];
      const isDefault = key === 'sort' ? value === defaultSort : key === 'page' ? Number(value) <= 1 : false;
      if (value === undefined || value === null || value === '' || isDefault) next.delete(key);
      else next.set(key, String(value));
    });

  if (keys.some((key) => key !== 'page' && known.has(key)) && !('page' in patch)) next.delete('page');
  return next;
}

/** List state -> API query params (no empty values, `per_page` added). */
export function toApiParams(state, { perPage = 15 } = {}) {
  const params = { page: state.page, per_page: perPage };
  Object.entries(state).forEach(([key, value]) => {
    if (key === 'page') return;
    if (value === '' || value === null || value === undefined) return;
    params[key] = value;
  });
  return params;
}

/** Filters only (for CSV export): same params minus paging and sorting. */
export function toExportParams(state) {
  return Object.fromEntries(
    Object.entries(state).filter(([key, value]) => key !== 'page' && key !== 'sort' && value !== '' && value != null),
  );
}

/** Next sort value when a column header is activated: asc -> desc -> default. */
export function nextSort(current, field, defaultSort = '') {
  if (current === field) return `-${field}`;
  if (current === `-${field}`) return defaultSort === `-${field}` ? field : defaultSort || field;
  return field;
}

/** 'ascending' | 'descending' | 'none' for `aria-sort`. */
export function ariaSort(current, field) {
  if (current === field) return 'ascending';
  if (current === `-${field}`) return 'descending';
  return 'none';
}
