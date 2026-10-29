import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Pager } from '@/components/ui';
import { adminKeys } from '../api/keys';
import { useAdminMutation, useResourceList } from '../api/hooks';
import { AdminPage } from './AdminPage';
import { ConfirmModal } from './ConfirmModal';
import { DataTable } from './DataTable';
import { FilterDate, FilterSelect, SearchBox, Toolbar } from './Toolbar';
import { useListState } from './useListState';

/** Icon-only row action: link, button or disabled. Always labelled for assistive tech. */
export function IconAction({ label, icon, to, onClick, tone, disabled }) {
  const className = `admin-icon-btn${tone === 'danger' ? ' admin-icon-btn--danger' : ''}`;
  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} title={label}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" className={className} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {icon}
    </button>
  );
}

/** First-column text that opens the record (a link or a button, never a bare div). */
export function RowTitle({ to, onClick, children, sub }) {
  return (
    <div className="admin-cell">
      {to ? (
        <Link to={to} className="admin-cell__title">
          {children}
        </Link>
      ) : !onClick ? (
        <span className="admin-cell__title">{children}</span>
      ) : (
        <button type="button" className="admin-cell__title admin-cell__title--button" onClick={onClick}>
          {children}
        </button>
      )}
      {sub && <span className="admin-cell__sub">{sub}</span>}
    </div>
  );
}

/**
 * The list-page pattern used by every resource: URL-synced search / filters /
 * sort / pagination, loading skeletons, empty + error states, delete with
 * confirmation. Each resource only declares its columns and filters.
 */
export function ResourceTable({
  resource,
  title,
  eyebrow,
  description,
  crumbs,
  columns,
  filters = [],
  searchPlaceholder,
  searchable = true,
  defaultSort = '-id',
  perPage = 15,
  createTo,
  createLabel = 'Create',
  editTo,
  rowActions,
  canDelete = true,
  entity = 'item',
  itemName = (row) => row.title ?? row.name ?? row.email ?? `#${row.id}`,
  deleteMessage,
  headerActions,
  toolbarEnd,
  emptyTitle,
  emptyDescription,
  children,
}) {
  const list = useListState({ filters: filters.map((filter) => filter.name), defaultSort, perPage });
  const query = useResourceList(resource, list.apiParams);
  const [target, setTarget] = useState(null);

  const rows = query.data?.data;
  const meta = query.data?.meta;

  const remove = useAdminMutation({
    mutationFn: (row) => resource.remove(row.id),
    invalidate: [adminKeys.resource(resource.name), adminKeys.dashboard],
    successMessage: () => `${entity[0].toUpperCase()}${entity.slice(1)} deleted`,
    onSuccess: () => {
      setTarget(null);
      if (rows?.length === 1 && list.state.page > 1) list.update({ page: list.state.page - 1 });
    },
    onError: () => setTarget(null),
  });

  const actionsColumn = {
    id: 'actions',
    header: <span className="sr-only">Actions</span>,
    align: 'end',
    cell: (row) => (
      <div className="admin-row-actions">
        {rowActions?.(row).map((action) => (
          <IconAction key={action.label} {...action} />
        ))}
        {editTo && <IconAction label={`Edit ${itemName(row)}`} icon={<IconPencil size={16} stroke={1.75} />} to={editTo(row)} />}
        {canDelete && (
          <IconAction label={`Delete ${itemName(row)}`} icon={<IconTrash size={16} stroke={1.75} />} tone="danger" onClick={() => setTarget(row)} />
        )}
      </div>
    ),
  };

  const create = createTo ? (
    <Button to={createTo} size="sm" leftIcon={<IconPlus size={16} stroke={2} />}>
      {createLabel}
    </Button>
  ) : null;

  return (
    <AdminPage
      title={title}
      eyebrow={eyebrow}
      description={description}
      crumbs={crumbs ?? [{ label: title }]}
      actions={
        <>
          {typeof headerActions === 'function' ? headerActions(list) : headerActions}
          {create}
        </>
      }
    >
      <Toolbar end={typeof toolbarEnd === 'function' ? toolbarEnd(list) : toolbarEnd}>
        {searchable && (
          <SearchBox
            value={list.state.search}
            onChange={(search) => list.update({ search })}
            placeholder={searchPlaceholder ?? 'Search'}
            label={`Search ${title.toLowerCase()}`}
          />
        )}
        {filters.map((filter) =>
          filter.type === 'date' ? (
            <FilterDate key={filter.name} label={filter.label} value={list.state[filter.name]} onChange={(value) => list.update({ [filter.name]: value })} />
          ) : (
            <FilterSelect
              key={filter.name}
              label={filter.label}
              value={list.state[filter.name]}
              options={filter.options ?? []}
              allLabel={filter.allLabel}
              onChange={(value) => list.update({ [filter.name]: value })}
            />
          ),
        )}
        {list.hasActiveFilters && (
          <button type="button" className="admin-toolbar__clear link-button" onClick={list.reset}>
            Clear filters
          </button>
        )}
      </Toolbar>

      {meta && (
        <p className="admin-count" role="status" aria-live="polite">
          <strong>{meta.total}</strong> {meta.total === 1 ? 'result' : 'results'}
          {list.hasActiveFilters ? ' match your filters' : ''}
        </p>
      )}

      <DataTable
        caption={`${title} list`}
        columns={[...columns, actionsColumn]}
        rows={rows}
        loading={query.isPending}
        fetching={query.isPlaceholderData}
        error={query.isError}
        onRetry={() => query.refetch()}
        sort={list.state.sort}
        defaultSort={defaultSort}
        onSort={(sort) => list.update({ sort })}
        emptyTitle={list.hasActiveFilters ? 'No matches' : (emptyTitle ?? `No ${title.toLowerCase()} yet`)}
        emptyDescription={list.hasActiveFilters ? 'Try different search words or clear the filters.' : emptyDescription}
        emptyAction={
          list.hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={list.reset}>
              Clear filters
            </Button>
          ) : (
            create
          )
        }
      />

      <Pager meta={meta} onChange={(page) => list.update({ page })} label={title.toLowerCase()} />

      {children?.(list)}

      <ConfirmModal
        opened={Boolean(target)}
        onClose={() => !remove.isPending && setTarget(null)}
        onConfirm={() => remove.mutate(target)}
        loading={remove.isPending}
        title={`Delete this ${entity}?`}
        message={deleteMessage?.(target) ?? (target ? `“${itemName(target)}” will be permanently removed. This cannot be undone.` : '')}
      />
    </AdminPage>
  );
}
