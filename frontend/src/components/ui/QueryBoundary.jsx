import { CardSkeletons, ErrorState } from './States';

/**
 * Standard loading / error / empty handling for a TanStack query so every
 * section renders all three states. `children(data)` renders the happy path.
 *
 *   <QueryBoundary query={q} empty={<EmptyState …/>} loading={<CardSkeletons count={3} />}>
 *     {(items) => <List items={items} />}
 *   </QueryBoundary>
 */
export function QueryBoundary({ query, select, isEmpty, empty = null, loading, errorTitle, errorDescription, children }) {
  if (query.isPending) return loading ?? <CardSkeletons count={3} height={220} />;
  if (query.isError) {
    return <ErrorState title={errorTitle} description={errorDescription} onRetry={() => query.refetch()} />;
  }
  const data = select ? select(query.data) : query.data;
  const nothing = isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0;
  if (nothing) return empty;
  return children(data);
}
