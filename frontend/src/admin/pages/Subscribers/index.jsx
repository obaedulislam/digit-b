import { formatDate } from '@/lib/format';
import { subscribersApi } from '../../api/resources';
import { ExportButton } from '../../components/ExportButton';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { StatusBadge } from '../../components/StatusBadge';

const columns = [
  {
    id: 'email',
    header: 'Email',
    primary: true,
    sortKey: 'email',
    cell: (row) => <RowTitle>{row.email}</RowTitle>,
  },
  { id: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.is_active ? 'active' : 'unsubscribed'} /> },
  {
    id: 'subscribed_at',
    header: 'Subscribed',
    sortKey: 'subscribed_at',
    hideBelow: 'md',
    cell: (row) => (row.subscribed_at ? formatDate(row.subscribed_at) : ''),
  },
  { id: 'unsubscribed_at', header: 'Unsubscribed', hideBelow: 'lg', cell: (row) => (row.unsubscribed_at ? formatDate(row.unsubscribed_at) : '') },
];

export default function Subscribers() {
  return (
    <ResourceTable
      resource={subscribersApi}
      title="Subscribers"
      eyebrow="Inbox"
      description="People who signed up for the newsletter."
      columns={columns}
      filters={[
        {
          name: 'status',
          label: 'Status',
          allLabel: 'All subscribers',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'unsubscribed', label: 'Unsubscribed' },
          ],
        },
      ]}
      searchPlaceholder="Search email"
      defaultSort="-id"
      perPage={25}
      entity="subscriber"
      itemName={(row) => row.email}
      deleteMessage={(row) => (row ? `${row.email} will be removed from the list permanently.` : '')}
      emptyDescription="Newsletter sign-ups from the website will appear here."
      headerActions={(list) => <ExportButton path="/admin/subscribers/export" params={list.exportParams} fallbackName="subscribers.csv" />}
    />
  );
}
