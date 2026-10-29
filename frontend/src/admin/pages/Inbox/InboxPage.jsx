import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Drawer, Textarea } from '@mantine/core';
import { IconMailForward, IconTrash } from '@tabler/icons-react';
import { Button, EmptyState, ErrorState, TextSkeleton } from '@/components/ui';
import { adminKeys } from '../../api/keys';
import { useAdminMutation, useResourceDetail } from '../../api/hooks';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DefinitionList } from '../../components/DefinitionList';
import { SelectField } from '../../components/fields/Inputs';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { UnsavedChangesModal } from '../../components/UnsavedChangesModal';
import { useUnsavedGuard } from '../../components/useUnsavedGuard';
import { buildMailto, fullDateTime } from '../../lib/helpers';
import { INQUIRY_STATUSES, labelOf } from '../../lib/options';

const drawerClasses = {
  content: 'admin-drawer',
  header: 'admin-drawer__header',
  title: 'admin-drawer__title',
  body: 'admin-drawer__body',
  close: 'admin-drawer__close',
};

/**
 * Shared inbox pattern (contact inquiries, mentorship requests):
 * a filterable table + a detail drawer (`?open=<id>`) with status workflow,
 * internal notes, reply-by-email and delete.
 */
export function InboxPage({ resource, title, eyebrow, description, entity, columns, filters, searchPlaceholder, details, messageLabel, message, subjectFor }) {
  return (
    <ResourceTable
      resource={resource}
      title={title}
      eyebrow={eyebrow}
      description={description}
      columns={columns}
      filters={filters}
      searchPlaceholder={searchPlaceholder}
      defaultSort="-created_at"
      entity={entity}
      canDelete
      itemName={(row) => row.name}
      emptyDescription={`${title} will appear here as soon as someone sends one.`}
    >
      {(list) => {
        const openId = list.searchParams.get('open');
        const close = () =>
          list.setSearchParams(
            (current) => {
              const next = new URLSearchParams(current);
              next.delete('open');
              return next;
            },
            { replace: true },
          );
        return (
          <InboxDrawer
            resource={resource}
            id={openId}
            onClose={close}
            entity={entity}
            details={details}
            messageLabel={messageLabel}
            message={message}
            subjectFor={subjectFor}
          />
        );
      }}
    </ResourceTable>
  );
}

/** First-column opener: sets "?open=id" (keeping filters) so the drawer is deep-linkable. */
export function OpenRow({ id, sub, children }) {
  const [, setSearchParams] = useSearchParams();
  const open = () =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('open', id);
        return next;
      },
      { replace: true },
    );
  return (
    <RowTitle onClick={open} sub={sub}>
      {children}
    </RowTitle>
  );
}

function InboxDrawer({ resource, id, onClose, entity, details, messageLabel, message, subjectFor }) {
  const query = useResourceDetail(resource, id);
  const record = query.data;

  return (
    <Drawer opened={Boolean(id)} onClose={onClose} position="right" size="min(580px, 100vw)" title={record ? record.name : `${entity[0].toUpperCase()}${entity.slice(1)}`} classNames={drawerClasses}>
      {query.isPending && id && <TextSkeleton lines={7} />}
      {query.isError && (
        query.error?.response?.status === 404 ? (
          <EmptyState title={`This ${entity} no longer exists`} />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      )}
      {record && (
        <InboxBody
          key={record.id}
          resource={resource}
          record={record}
          onClose={onClose}
          entity={entity}
          details={details}
          messageLabel={messageLabel}
          message={message}
          subjectFor={subjectFor}
        />
      )}
    </Drawer>
  );
}

function InboxBody({ resource, record, onClose, entity, details, messageLabel, message, subjectFor }) {
  const [status, setStatus] = useState(record.status);
  const [notes, setNotes] = useState(record.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = status !== record.status || notes !== (record.notes ?? '');
  const guard = useUnsavedGuard(dirty);
  const markedRead = useRef(false);

  const invalidate = [adminKeys.resource(resource.name), adminKeys.dashboard];

  const save = useAdminMutation({
    mutationFn: () => resource.patch(record.id, { status, notes: notes.trim() === '' ? null : notes }),
    invalidate,
    successMessage: 'Changes saved',
  });

  const markRead = useAdminMutation({
    mutationFn: () => resource.patch(record.id, { status: 'read' }),
    invalidate,
  });

  const remove = useAdminMutation({
    mutationFn: () => resource.remove(record.id),
    invalidate: [[...adminKeys.resource(resource.name), 'list'], adminKeys.dashboard],
    successMessage: () => `${entity[0].toUpperCase()}${entity.slice(1)} deleted`,
    onSuccess: onClose,
    onError: () => setConfirmDelete(false),
  });

  // Opening a new message marks it as read (like any inbox).
  const { mutate: markAsRead } = markRead;
  const shouldMark = record.status === 'new';
  useEffect(() => {
    if (shouldMark && !markedRead.current) {
      markedRead.current = true;
      markAsRead();
    }
  }, [shouldMark, markAsRead]);

  // The record refreshes after a save or the auto "read": follow the server value if the user has not changed it.
  const [serverStatus, setServerStatus] = useState(record.status);
  if (record.status !== serverStatus) {
    setServerStatus(record.status);
    if (status === serverStatus) setStatus(record.status);
  }

  return (
    <div className="admin-inbox">
      <DefinitionList columns={1} items={[...details(record), { label: 'Received', value: fullDateTime(record.created_at) }]} />

      <section className="admin-inbox__message" aria-label={messageLabel}>
        <h3 className="admin-inbox__heading">{messageLabel}</h3>
        <p className="admin-prose">{message(record)}</p>
      </section>

      <form
        className="admin-stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (dirty && !save.isPending) save.mutate();
        }}
      >
        <SelectField label="Status" options={INQUIRY_STATUSES} value={status} onChange={(event) => setStatus(event.target.value)} description={`Workflow: new, read, replied, archived. Now: ${labelOf(INQUIRY_STATUSES, record.status)}`} />
        <Textarea label="Internal notes" autosize minRows={3} maxLength={4000} value={notes} onChange={(event) => setNotes(event.currentTarget.value)} placeholder="Only your team can see this." />
        <div className="admin-inbox__actions">
          <Button type="submit" size="sm" loading={save.isPending} disabled={!dirty}>
            Save changes
          </Button>
          <Button href={buildMailto(record.email, { subject: subjectFor(record), name: record.name })} variant="secondary" size="sm" leftIcon={<IconMailForward size={16} stroke={1.75} />}>
            Reply by email
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} leftIcon={<IconTrash size={16} stroke={1.75} />}>
            Delete
          </Button>
        </div>
      </form>

      <ConfirmModal
        opened={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title={`Delete this ${entity}?`}
        message={`The message from ${record.name} will be permanently removed.`}
      />
      <UnsavedChangesModal guard={guard} />
    </div>
  );
}
