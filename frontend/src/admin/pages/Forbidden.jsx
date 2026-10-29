import { IconLock } from '@tabler/icons-react';
import { Button } from '@/components/ui';
import { AdminPage } from '../components/AdminPage';
import { useAuth } from '../auth/AuthContext';
import { firstAllowedPath, roleLabel } from '../lib/permissions';
import { NAV_ITEMS } from '../layout/nav';

/** Friendly 403: the user is signed in but their role does not include this area. */
export function Forbidden() {
  const { user } = useAuth();
  const home = firstAllowedPath(user, NAV_ITEMS);

  return (
    <AdminPage title="You do not have access to this area" seoTitle="No access">
      <div className="admin-forbidden" role="alert">
        <span className="admin-forbidden__icon" aria-hidden="true">
          <IconLock size={28} stroke={1.5} />
        </span>
        <p className="admin-forbidden__text">
          Your account ({user?.roles?.map(roleLabel).join(', ') || 'no role'}) does not include this section. If you think this is a mistake, ask a super
          admin to update your role.
        </p>
        <div className="admin-forbidden__actions">{home && <Button to={home}>Go to a page you can open</Button>}</div>
      </div>
    </AdminPage>
  );
}
