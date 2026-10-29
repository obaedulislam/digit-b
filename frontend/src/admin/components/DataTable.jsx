import { Skeleton } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';
import { EmptyState, ErrorState } from '@/components/ui';
import { ariaSort, nextSort } from '../lib/listParams';

/**
 * Accessible data table.
 *  columns: [{ id, header, cell(row), sortKey?, align?, hideBelow?: 'md'|'lg', primary? }]
 * Lives in a keyboard-focusable scroll region so narrow screens never overflow the page.
 */
export function DataTable({
  caption,
  columns,
  rows,
  rowKey = 'id',
  loading = false,
  fetching = false,
  error = false,
  onRetry,
  sort,
  defaultSort,
  onSort,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  skeletonRows = 7,
}) {
  if (error && !rows?.length) {
    return <ErrorState title="We could not load this list" description="The server did not respond as expected." onRetry={onRetry} />;
  }

  if (!loading && rows && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  const cellClass = (column, element) =>
    ['admin-table__' + element, column.align === 'end' && 'is-end', column.hideBelow && `hide-below-${column.hideBelow}`].filter(Boolean).join(' ');

  return (
    <div className={`admin-table-wrap${fetching ? ' is-fetching' : ''}`} role="region" aria-label={caption} tabIndex={0}>
      <table className="admin-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cellClass(column, 'th')}
                aria-sort={column.sortKey ? ariaSort(sort, column.sortKey) : undefined}
              >
                {column.sortKey && onSort ? (
                  <button type="button" className="admin-table__sort" onClick={() => onSort(nextSort(sort, column.sortKey, defaultSort))}>
                    {column.header}
                    <SortIcon sort={sort} field={column.sortKey} />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading || !rows
            ? Array.from({ length: skeletonRows }, (_, index) => (
                <tr key={index} aria-hidden="true">
                  {columns.map((column) => (
                    <td key={column.id} className={cellClass(column, 'td')}>
                      <Skeleton height={14} width={column.primary ? '80%' : '60%'} radius="sm" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr key={row[rowKey]}>
                  {columns.map((column) =>
                    column.primary ? (
                      <th key={column.id} scope="row" className={cellClass(column, 'td') + ' admin-table__td--primary'}>
                        {column.cell(row)}
                      </th>
                    ) : (
                      <td key={column.id} className={cellClass(column, 'td')}>
                        {column.cell(row)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ sort, field }) {
  if (sort === field) return <IconArrowUp size={14} stroke={2} aria-hidden="true" />;
  if (sort === `-${field}`) return <IconArrowDown size={14} stroke={2} aria-hidden="true" />;
  return <IconArrowsSort size={14} stroke={1.75} aria-hidden="true" className="admin-table__sort-idle" />;
}
