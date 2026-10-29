import { timeAgo } from '@/lib/format';
import { inquiriesApi } from '../../api/resources';
import { StatusBadge } from '../../components/StatusBadge';
import { fullDateTime } from '../../lib/helpers';
import { INQUIRY_STATUSES, INQUIRY_TYPES, labelOf } from '../../lib/options';
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
    id: 'subject',
    header: 'Message',
    cell: (row) => (
      <div className="admin-cell">
        <span className="admin-cell__clamp">{row.subject || row.message}</span>
        <span className="admin-cell__sub">{row.company}</span>
      </div>
    ),
  },
  { id: 'type', header: 'Type', hideBelow: 'md', sortKey: 'inquiry_type', cell: (row) => labelOf(INQUIRY_TYPES, row.inquiry_type) },
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

export default function Inquiries() {
  return (
    <InboxPage
      resource={inquiriesApi}
      title="Inquiries"
      eyebrow="Inbox"
      description="Messages sent through the contact form."
      entity="inquiry"
      columns={columns}
      filters={[
        { name: 'status', label: 'Status', options: INQUIRY_STATUSES, allLabel: 'All statuses' },
        { name: 'inquiry_type', label: 'Type', options: INQUIRY_TYPES, allLabel: 'All types' },
      ]}
      searchPlaceholder="Search name, email, company, message"
      messageLabel="Message"
      message={(record) => record.message}
      subjectFor={(record) => record.subject || 'your message to DIGIT-B'}
      details={(record) => [
        { label: 'Email', value: <a href={`mailto:${record.email}`}>{record.email}</a> },
        { label: 'Phone', value: record.phone },
        { label: 'Company', value: record.company },
        { label: 'Type', value: labelOf(INQUIRY_TYPES, record.inquiry_type) },
        { label: 'Subject', value: record.subject },
      ]}
    />
  );
}
