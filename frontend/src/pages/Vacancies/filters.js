/** Filter ↔ URL mapping for the vacancies page (pure, unit-tested). */

export const JOB_SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'salary_desc', label: 'Highest salary' },
  { value: 'title', label: 'Title A–Z' },
];

export const DEFAULT_SORT = 'newest';
export const PER_PAGE = 10;

/** Facet keys, in the order they appear in the sidebar. */
export const FACETS = [
  { key: 'employment_type', facet: 'employment_types', label: 'Employment type' },
  { key: 'work_mode', facet: 'work_modes', label: 'Work mode' },
  { key: 'location', facet: 'locations', label: 'Location' },
  { key: 'department', facet: 'departments', label: 'Department' },
];

export const FILTER_KEYS = FACETS.map((f) => f.key);

/** URLSearchParams → normalised state. Unknown / malformed values fall back to defaults. */
export function parseJobParams(params) {
  const get = (key) => (params.get(key) ?? '').trim();
  const sort = JOB_SORTS.some((s) => s.value === get('sort')) ? get('sort') : DEFAULT_SORT;
  const page = Math.max(1, Number.parseInt(get('page'), 10) || 1);
  return {
    search: get('search'),
    employment_type: get('employment_type'),
    work_mode: get('work_mode'),
    location: get('location'),
    department: get('department'),
    sort,
    page,
  };
}

/**
 * Applies `patch` to the current URL params and returns new params.
 * Defaults are omitted so URLs stay short and shareable; any change except an
 * explicit `page` resets pagination to page 1.
 */
export function patchJobParams(current, patch) {
  const state = { ...parseJobParams(current), ...patch };
  if (!('page' in patch)) state.page = 1;
  const next = new URLSearchParams();
  if (state.search) next.set('search', state.search);
  FILTER_KEYS.forEach((key) => state[key] && next.set(key, state[key]));
  if (state.sort !== DEFAULT_SORT) next.set('sort', state.sort);
  if (state.page > 1) next.set('page', String(state.page));
  return next;
}

/** State → API query params for `queries.jobs()`. */
export function toApiParams(state, search = state.search) {
  return {
    search: search || undefined,
    employment_type: state.employment_type || undefined,
    work_mode: state.work_mode || undefined,
    location: state.location || undefined,
    department: state.department || undefined,
    sort: state.sort,
    page: state.page,
    per_page: PER_PAGE,
  };
}

/** Number of narrowing filters (search counts, sort does not). */
export const activeFilterCount = (state) => FILTER_KEYS.filter((key) => state[key]).length + (state.search ? 1 : 0);

/** Resolves the human label for an active filter value from the facet list. */
export function facetLabel(facets, facetName, value) {
  const option = facets?.[facetName]?.find((o) => String(o.value) === String(value));
  return option?.label ?? value;
}
