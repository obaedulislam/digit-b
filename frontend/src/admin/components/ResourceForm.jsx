import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { Button, EmptyState, ErrorState, TextSkeleton } from '@/components/ui';
import { adminKeys } from '../api/keys';
import { useAdminMutation, useResourceDetail } from '../api/hooks';
import { focusFirstInvalid } from '../lib/formErrors';
import { notifyError } from '../lib/notify';
import { AdminPage } from './AdminPage';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { useUnsavedGuard } from './useUnsavedGuard';

/**
 * Create / edit page pattern shared by every resource.
 *
 *  - `Fields`  component receiving `{ form, isEdit, record }` and rendering the explicit field list
 *  - `Aside`   optional component for the right-hand column (status, SEO, …)
 *  - `defaults` values for a new record; `fromRecord(record)` maps API -> form values
 *  - `toPayload(values, record)` maps form values -> API payload
 *  - `validate` Mantine validation (mirrors the backend rules)
 *
 * Handles: loading / 404 / error states, dirty tracking + unsaved-changes guard,
 * 422 -> field errors, success toast, cache invalidation, redirect.
 */
export function ResourceForm({ id, ...props }) {
  const isEdit = id !== undefined && id !== null;
  const { resource, entity, listPath, listLabel } = props;
  // Always fetch fresh data for an edit form, so you never edit a stale cached copy.
  const query = useResourceDetail(resource, id, { enabled: isEdit, gcTime: 0, staleTime: 0 });

  if (isEdit && query.isPending) {
    return (
      <AdminPage title="Loading…" seoTitle={`Edit ${entity}`} crumbs={[{ label: listLabel, to: listPath }, { label: 'Edit' }]}>
        <TextSkeleton lines={8} />
      </AdminPage>
    );
  }
  if (isEdit && query.isError) {
    const missing = query.error?.response?.status === 404;
    return (
      <AdminPage title={missing ? 'Not found' : 'Could not load'} seoTitle={`Edit ${entity}`} crumbs={[{ label: listLabel, to: listPath }, { label: 'Edit' }]}>
        {missing ? (
          <EmptyState title={`This ${entity} no longer exists`} description="It may have been deleted." action={<Button to={listPath}>Back to {listLabel.toLowerCase()}</Button>} />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )}
      </AdminPage>
    );
  }

  return <FormBody key={isEdit ? id : 'new'} id={id} isEdit={isEdit} record={query.data} {...props} />;
}

function FormBody({
  id,
  isEdit,
  record,
  resource,
  entity,
  listPath,
  listLabel,
  title,
  recordTitle,
  defaults,
  fromRecord,
  toPayload,
  validate,
  Fields,
  Aside,
  afterCreate,
  headerActions,
}) {
  const navigate = useNavigate();
  const initialValues = isEdit ? fromRecord(record) : defaults;
  const form = useForm({ initialValues, validate, validateInputOnBlur: false });
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialValues));
  const dirty = JSON.stringify(form.values) !== baseline;
  const guard = useUnsavedGuard(dirty);

  const mutation = useAdminMutation({
    mutationFn: (values) => (isEdit ? resource.update(id, toPayload(values, record)) : resource.create(toPayload(values))),
    invalidate: [adminKeys.resource(resource.name), adminKeys.dashboard],
    successMessage: () => `${entity[0].toUpperCase()}${entity.slice(1)} ${isEdit ? 'saved' : 'created'}`,
    form,
    onSuccess: (saved, values) => {
      setBaseline(JSON.stringify(values));
      if (!isEdit) {
        guard.allowNext();
        navigate(afterCreate?.(saved) ?? listPath);
      }
    },
  });

  const onInvalid = () => {
    notifyError('Please fix the highlighted fields.', 'Check the form');
    focusFirstInvalid();
  };

  const heading = isEdit ? (recordTitle?.(record) ?? title) : title;

  return (
    <AdminPage
      title={heading}
      seoTitle={`${isEdit ? 'Edit' : 'New'} ${entity}`}
      crumbs={[{ label: listLabel, to: listPath }, { label: isEdit ? 'Edit' : 'New' }]}
      actions={headerActions?.({ record, isEdit })}
    >
      <form className="admin-form" onSubmit={form.onSubmit((values) => !mutation.isPending && mutation.mutate(values), onInvalid)} noValidate>
        <div className={`admin-form__layout${Aside ? ' has-aside' : ''}`}>
          <div className="admin-form__main">
            <Fields form={form} isEdit={isEdit} record={record} />
          </div>
          {Aside && (
            <div className="admin-form__aside">
              <Aside form={form} isEdit={isEdit} record={record} />
            </div>
          )}
        </div>

        <div className="admin-form__bar" role="group" aria-label="Form actions">
          <p className={`admin-form__dirty${dirty ? ' is-dirty' : ''}`} role="status" aria-live="polite">
            <span className="admin-form__dot" aria-hidden="true" />
            {dirty ? 'Unsaved changes' : isEdit ? 'All changes saved' : 'Not saved yet'}
          </p>
          <div className="admin-form__bar-actions">
            <Link to={listPath} className="btn btn--ghost btn--sm">
              Cancel
            </Link>
            <Button type="submit" size="sm" loading={mutation.isPending} disabled={isEdit && !dirty}>
              {isEdit ? 'Save changes' : `Create ${entity}`}
            </Button>
          </div>
        </div>
      </form>
      <UnsavedChangesModal guard={guard} />
    </AdminPage>
  );
}
