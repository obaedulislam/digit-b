import { IconEye } from '@tabler/icons-react';
import { timeAgo } from '@/lib/format';
import { applicationsApi, jobsApi } from '../../api/resources';
import { useOptionsList } from '../../api/hooks';
import { ExportButton } from '../../components/ExportButton';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { StatusBadge } from '../../components/StatusBadge';
import { fullDateTime, pluralizeYears } from '../../lib/helpers';
import { APPLICATION_STATUSES } from '../../lib/options';

export default function Applications() {
  const jobs = useOptionsList(jobsApi, { per_page: 50, sort: 'title' });

  const filters = [
    { name: 'status', label: 'Status', options: APPLICATION_STATUSES, allLabel: 'All statuses' },
    {
      name: 'job',
      label: 'Job',
      allLabel: 'All jobs',
      options: (jobs.data ?? []).map((job) => ({ value: String(job.id), label: job.title })),
    },
    { name: 'date_from', label: 'From', type: 'date' },
    { name: 'date_to', label: 'To', type: 'date' },
  ];

  const columns = [
    {
      id: 'applicant',
      header: 'Applicant',
      primary: true,
      cell: (row) => (
        <RowTitle to={`/admin/applications/${row.id}`} sub={row.applicant?.email}>
          {row.applicant?.full_name}
        </RowTitle>
      ),
    },
    {
      id: 'job',
      header: 'Applied for',
      hideBelow: 'md',
      cell: (row) => (
        <div className="admin-cell">
          <span>{row.job?.title ?? 'General talent pool'}</span>
          {row.job?.reference_code && <span className="admin-cell__sub">{row.job.reference_code}</span>}
        </div>
      ),
    },
    { id: 'status', header: 'Status', sortKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: 'experience',
      header: 'Profile',
      hideBelow: 'lg',
      cell: (row) => (
        <div className="admin-cell">
          <span>{row.applicant?.current_title}</span>
          <span className="admin-cell__sub">
            {[row.applicant?.location, pluralizeYears(row.applicant?.years_experience)].filter(Boolean).join(' · ')}
          </span>
        </div>
      ),
    },
    {
      id: 'created_at',
      header: 'Submitted',
      sortKey: 'created_at',
      hideBelow: 'md',
      cell: (row) => (
        <time dateTime={row.created_at} title={fullDateTime(row.created_at)} className="admin-cell__time">
          {timeAgo(row.created_at)}
        </time>
      ),
    },
  ];

  return (
    <ResourceTable
      resource={applicationsApi}
      title="Applications"
      eyebrow="Recruitment"
      description="Review candidates, move them through the pipeline and download résumés."
      columns={columns}
      filters={filters}
      searchPlaceholder="Search name, email, title, location"
      defaultSort="-created_at"
      entity="application"
      itemName={(row) => row.applicant?.full_name ?? `#${row.id}`}
      rowActions={(row) => [{ label: `View ${row.applicant?.full_name}`, icon: <IconEye size={16} stroke={1.75} />, to: `/admin/applications/${row.id}` }]}
      deleteMessage={(row) => (row ? `The application from ${row.applicant?.full_name} will be removed from the list.` : '')}
      emptyDescription="Applications submitted through the website will appear here."
      headerActions={(list) => (
        <ExportButton path="/admin/applications/export" params={list.exportParams} fallbackName="applications.csv" />
      )}
    />
  );
}
