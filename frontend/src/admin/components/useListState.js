import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readListParams, toApiParams, toExportParams, writeListParams } from '../lib/listParams';

/**
 * URL-synced list state (page, search, sort, filters) for every admin table.
 *   const list = useListState({ filters: ['status'], defaultSort: '-created_at' });
 *   list.state.page · list.apiParams · list.update({ status: 'new' }) · list.reset()
 */
export function useListState({ filters = [], defaultSort = '', perPage = 15 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterKey = filters.join(',');
  const config = useMemo(() => ({ filters: filterKey ? filterKey.split(',') : [], defaultSort }), [filterKey, defaultSort]);

  const state = useMemo(() => readListParams(searchParams, config), [searchParams, config]);
  const apiParams = useMemo(() => toApiParams(state, { perPage }), [state, perPage]);
  const exportParams = useMemo(() => toExportParams(state), [state]);

  const update = useCallback(
    (patch) => setSearchParams((current) => writeListParams(current, patch, config), { replace: true }),
    [setSearchParams, config],
  );

  const reset = useCallback(
    () =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          ['page', 'search', 'sort', ...config.filters].forEach((key) => next.delete(key));
          return next;
        },
        { replace: true },
      ),
    [setSearchParams, config],
  );

  const hasActiveFilters = state.search !== '' || config.filters.some((name) => state[name] !== '');

  return { state, apiParams, exportParams, update, reset, hasActiveFilters, searchParams, setSearchParams };
}
