import { timeAgo } from '@/lib/format';
import { mentorshipRequestsApi } from '../../api/resources';
import { StatusBadge } from '../../components/StatusBadge';
import { fullDateTime } from '../../lib/helpers';
import { INQUIRY_STATUSES } from '../../lib/options';
import { InboxPage, OpenRow } from '../Inbox/InboxPage';

const columns = [
  {
    id: 'name',
    header: 'From',
    primary: true,
    sortKey: 'name',
    cell: (row) => (
      <OpenRow id={row.id} sub={row.email}>
        {row.name}
      </OpenRow>
    ),
  },
  {
    id: 'program',
    header: 'Program',
    cell: (row) => (
      <div className="admin-cell">
        <span>{row.program?.name ?? 'Program removed'}</span>
        <span className="admin-cell__sub admin-cell__clamp">{row.goal}</span>
      </div>
    ),
  },
  { id: 'status', header: 'Status', sortKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
  {
    id: 'created_at',
    header: 'Received',
    sortKey: 'created_at',
    hideBelow: 'md',
    cell: (row) => (
      <time dateTime={row.created_at} title={fullDateTime(row.created_at)} className="admin-cell__time">
        {timeAgo(row.created_at)}
      </time>
    ),
  },
];

export default function MentorshipRequests() {
  return (
    <InboxPage
      resource={mentorshipRequestsApi}
      title="Mentorship requests"
      eyebrow="Inbox"
      description="People asking to join a mentorship program."
      entity="request"
      columns={columns}
      filters={[{ name: 'status', label: 'Status', options: INQUIRY_STATUSES, allLabel: 'All statuses' }]}
      searchPlaceholder="Search name, email or goal"
      messageLabel="Goal"
      message={(record) => record.goal}
      subjectFor={(record) => `your ${record.program?.name ?? 'mentorship'} request`}
      details={(record) => [
        { label: 'Email', value: <a href={`mailto:${record.email}`}>{record.email}</a> },
        { label: 'Phone', value: record.phone },
        { label: 'Program', value: record.program?.name },
        { label: 'Current role', value: record.current_role },
      ]}
    />
  );
}
