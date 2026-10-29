import { Button, EmptyState } from '@/components/ui';
import { AdminPage } from '../components/AdminPage';

export default function AdminNotFound() {
  return (
    <AdminPage title="Page not found" crumbs={[{ label: 'Not found' }]}>
      <EmptyState
        title="This admin page does not exist"
        description="The link may be out of date, or the page was moved."
        action={<Button to="/admin">Back to the dashboard</Button>}
      />
    </AdminPage>
  );
}
