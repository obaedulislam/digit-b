import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@mantine/core';
import { IconBrandLinkedin, IconDownload, IconFileText, IconNotes, IconRefresh, IconTrash } from '@tabler/icons-react';
import { Button, EmptyState, ErrorState, TextSkeleton } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/format';
import { adminKeys } from '../../api/keys';
import { useAdminMutation, useResourceDetail } from '../../api/hooks';
import { applicationsApi } from '../../api/resources';
import { AdminPage } from '../../components/AdminPage';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DefinitionList } from '../../components/DefinitionList';
import { SelectField } from '../../components/fields/Inputs';
import { StatusBadge } from '../../components/StatusBadge';
import { UnsavedChangesModal } from '../../components/UnsavedChangesModal';
import { useUnsavedGuard } from '../../components/useUnsavedGuard';
import { downloadFile } from '../../lib/download';
import { mapFormError } from '../../lib/formErrors';
import { formatBytes, fullDateTime, humanize } from '../../lib/helpers';
import { notifyError, notifySuccess } from '../../lib/notify';
import { APPLICATION_STATUSES, EDUCATION, WORK_MODES, labelOf } from '../../lib/options';

export default function ApplicationDetail() {
  const { id } = useParams();
  const query = useResourceDetail(applicationsApi, id);
  const crumbs = [{ label: 'Applications', to: '/admin/applications' }, { label: 'Application' }];

  if (query.isPending) {
    return (
      <AdminPage title="Loading application…" seoTitle="Application" crumbs={crumbs}>
        <TextSkeleton lines={9} />
      </AdminPage>
    );
  }
  if (query.isError) {
    const missing = query.error?.response?.status === 404;
    return (
      <AdminPage title={missing ? 'Application not found' : 'Could not load the application'} seoTitle="Application" crumbs={crumbs}>
        {missing ? (
          <EmptyState title="This application no longer exists" action={<Button to="/admin/applications">Back to applications</Button>} />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )}
      </AdminPage>
    );
  }

  return <DetailBody application={query.data} />;
}

function DetailBody({ application }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { applicant } = application;

  const remove = useAdminMutation({
    mutationFn: () => applicationsApi.remove(application.id),
    // Lists only: refetching this (now deleted) record would flash a 404.
    invalidate: [[...adminKeys.resource('applications'), 'list'], adminKeys.dashboard],
    successMessage: 'Application deleted',
    onSuccess: () => navigate('/admin/applications', { replace: true }),
    onError: () => setConfirmDelete(false),
  });

  const downloadResume = async () => {
    setDownloading(true);
    try {
      const name = await downloadFile(`/admin/applications/${application.id}/resume`, {
        fallbackName: application.resume?.original_name || 'resume',
      });
      notifySuccess(`${name} downloaded`, 'Résumé');
    } catch (error) {
      notifyError(mapFormError(error).message, 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminPage
      title={applicant.full_name}
      seoTitle={`Application: ${applicant.full_name}`}
      eyebrow={`Application #${application.id}`}
      crumbs={[{ label: 'Applications', to: '/admin/applications' }, { label: applicant.full_name }]}
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadResume}
            loading={downloading}
            disabled={!application.has_resume}
            leftIcon={<IconDownload size={16} stroke={1.75} />}
          >
            Download résumé
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} leftIcon={<IconTrash size={16} stroke={1.75} />}>
            Delete
          </Button>
        </>
      }
    >
      <div className="admin-detail">
        <div className="admin-detail__main">
          <section className="admin-card" aria-labelledby="applicant-h">
            <header className="admin-card__header">
              <h2 className="admin-card__title" id="applicant-h">
                Applicant
              </h2>
            </header>
            <div className="admin-card__body">
              <DefinitionList
                items={[
                  { label: 'Email', value: <a href={`mailto:${applicant.email}`}>{applicant.email}</a> },
                  { label: 'Phone', value: applicant.phone ? <a href={`tel:${applicant.phone.replace(/[^\d+]/g, '')}`}>{applicant.phone}</a> : null },
                  { label: 'Location', value: applicant.location },
                  {
                    label: 'LinkedIn',
                    value: applicant.linkedin_url ? (
                      <a href={applicant.linkedin_url} target="_blank" rel="noopener noreferrer" className="admin-inline-link">
                        <IconBrandLinkedin size={16} stroke={1.75} aria-hidden="true" /> Open profile<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null,
                  },
                  { label: 'Current title', value: applicant.current_title },
                  { label: 'Current company', value: applicant.current_company },
                  { label: 'Experience', value: applicant.years_experience !== null && applicant.years_experience !== undefined ? `${applicant.years_experience} ${applicant.years_experience === 1 ? 'year' : 'years'}` : null },
                  { label: 'Education', value: EDUCATION[applicant.highest_education] ?? humanize(applicant.highest_education) },
                  { label: 'Work preference', value: labelOf(WORK_MODES, application.work_status) },
                  { label: 'Expected salary', value: application.expected_salary ? application.expected_salary.toLocaleString() : null },
                  { label: 'Available from', value: application.available_from ? formatDate(application.available_from, { long: true }) : null },
                  { label: 'Consent recorded', value: application.consented_at ? fullDateTime(application.consented_at) : null },
                  {
                    label: 'Skills',
                    wide: true,
                    value: applicant.skills?.length ? (
                      <ul className="admin-chips">
                        {applicant.skills.map((skill) => (
                          <li key={skill} className="admin-chips__item">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    ) : null,
                  },
                ]}
              />
            </div>
          </section>

          <section className="admin-card" aria-labelledby="cover-h">
            <header className="admin-card__header">
              <h2 className="admin-card__title" id="cover-h">
                Cover letter
              </h2>
            </header>
            <div className="admin-card__body">
              {application.cover_letter ? <p className="admin-prose">{application.cover_letter}</p> : <p className="admin-muted">The applicant did not include a cover letter.</p>}
            </div>
          </section>

          <section className="admin-card" aria-labelledby="timeline-h">
            <header className="admin-card__header">
              <h2 className="admin-card__title" id="timeline-h">
                Activity
              </h2>
            </header>
            <div className="admin-card__body">
              <Timeline events={application.events ?? []} />
            </div>
          </section>
        </div>

        <aside className="admin-detail__aside" aria-label="Application workflow">
          <StatusPanel application={application} />
          <NotesPanel application={application} />

          <section className="admin-card" aria-labelledby="source-h">
            <header className="admin-card__header">
              <h2 className="admin-card__title" id="source-h">
                Application
              </h2>
            </header>
            <div className="admin-card__body">
              <DefinitionList
                columns={1}
                items={[
                  {
                    label: 'Applied for',
                    value: application.job ? (
                      <Link to={`/admin/jobs/${application.job.id}`} className="admin-inline-link">
                        {application.job.title}
                      </Link>
                    ) : (
                      'General talent pool'
                    ),
                  },
                  { label: 'Reference', value: application.job?.reference_code },
                  { label: 'Submitted', value: fullDateTime(application.created_at) },
                  {
                    label: 'Résumé',
                    value: application.has_resume ? (
                      <span className="admin-file">
                        <IconFileText size={16} stroke={1.75} aria-hidden="true" />
                        <span>
                          {application.resume?.original_name}
                          {application.resume?.size ? ` (${formatBytes(application.resume.size)})` : ''}
                        </span>
                      </span>
                    ) : (
                      'No file stored'
                    ),
                  },
                ]}
              />
            </div>
          </section>
        </aside>
      </div>

      <ConfirmModal
        opened={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title="Delete this application?"
        message={`The application from ${applicant.full_name} will be removed from the list.`}
      />
    </AdminPage>
  );
}

function StatusPanel({ application }) {
  const [value, setValue] = useState(application.status);
  const [seen, setSeen] = useState(application.status);
  if (application.status !== seen) {
    setSeen(application.status);
    setValue(application.status);
  }

  const update = useAdminMutation({
    mutationFn: (status) => applicationsApi.patch(application.id, { status }),
    invalidate: [adminKeys.resource('applications'), adminKeys.dashboard],
    successMessage: (_, status) => `Status changed to ${labelOf(APPLICATION_STATUSES, status)}`,
  });

  const changed = value !== application.status;

  return (
    <section className="admin-card" aria-labelledby="status-h">
      <header className="admin-card__header admin-card__header--row">
        <h2 className="admin-card__title" id="status-h">
          Status
        </h2>
        <StatusBadge status={application.status} />
      </header>
      <form
        className="admin-card__body admin-stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (changed && !update.isPending) update.mutate(value);
        }}
      >
        <SelectField label="Move to" options={APPLICATION_STATUSES} value={value} onChange={(event) => setValue(event.target.value)} />
        <Button type="submit" size="sm" block loading={update.isPending} disabled={!changed} leftIcon={<IconRefresh size={16} stroke={1.75} />}>
          Update status
        </Button>
      </form>
    </section>
  );
}

function NotesPanel({ application }) {
  const [value, setValue] = useState(application.notes ?? '');
  const [saved, setSaved] = useState(application.notes ?? '');
  const dirty = value !== saved;
  const guard = useUnsavedGuard(dirty);

  const save = useAdminMutation({
    mutationFn: (notes) => applicationsApi.patch(application.id, { notes: notes.trim() === '' ? null : notes }),
    invalidate: [adminKeys.resource('applications')],
    successMessage: 'Notes saved',
    onSuccess: (_, notes) => setSaved(notes),
  });

  return (
    <section className="admin-card" aria-labelledby="notes-h">
      <header className="admin-card__header">
        <h2 className="admin-card__title" id="notes-h">
          Internal notes
        </h2>
        <p className="admin-card__text">Only visible to your team. Each change is logged in the activity feed.</p>
      </header>
      <form
        className="admin-card__body admin-stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (dirty && !save.isPending) save.mutate(value);
        }}
      >
        <Textarea
          label="Notes"
          aria-label="Internal notes"
          autosize
          minRows={4}
          maxLength={4000}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder="Interview feedback, call notes, next steps…"
        />
        <Button type="submit" size="sm" block variant="secondary" loading={save.isPending} disabled={!dirty} leftIcon={<IconNotes size={16} stroke={1.75} />}>
          Save notes
        </Button>
      </form>
      <UnsavedChangesModal guard={guard} />
    </section>
  );
}

function describe(event) {
  if (event.type === 'status_changed') {
    return (
      <>
        Status changed from <StatusBadge status={event.from_status} /> to <StatusBadge status={event.to_status} />
      </>
    );
  }
  if (event.type === 'note_updated') return <>Internal notes updated{event.note ? <q className="admin-timeline__note">{event.note}</q> : ' (cleared)'}</>;
  if (event.type === 'created') return <>{event.note || 'Application submitted'}</>;
  return <>{humanize(event.type)}</>;
}

function Timeline({ events }) {
  if (!events.length) return <p className="admin-muted">No activity recorded yet.</p>;
  const ordered = [...events].reverse();
  return (
    <ol className="admin-timeline">
      {ordered.map((event) => (
        <li key={event.id} className="admin-timeline__item">
          <span className="admin-timeline__dot" aria-hidden="true" />
          <div className="admin-timeline__body">
            <p className="admin-timeline__text">{describe(event)}</p>
            <p className="admin-timeline__meta">
              {event.user?.name ?? 'System'} ·{' '}
              <time dateTime={event.created_at} title={fullDateTime(event.created_at)}>
                {timeAgo(event.created_at)}
              </time>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
