import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState } from '@/components/ui';
import { Seo } from '@/components/ui/Seo';
import { useAuth } from './AuthContext';
import { Forbidden } from '../pages/Forbidden';

export function FullPageLoader({ label = 'Loading the admin…' }) {
  return (
    <div className="admin-boot" role="status" aria-live="polite">
      <span className="admin-boot__spinner" aria-hidden="true" />
      <span className="admin-boot__label">{label}</span>
    </div>
  );
}

/** Redirects guests to /admin/login, remembering where they were headed. */
export function RequireAuth({ children }) {
  const { status, refetch } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'error') {
    return (
      <div className="admin-boot">
        <Seo title="Admin unavailable" noindex />
        <ErrorState
          title="We could not reach the server"
          description="Check your connection, then try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }
  if (status === 'guest') {
    const next = `${location.pathname}${location.search}`;
    const query = next && next !== '/admin' && next !== '/admin/' ? `?next=${encodeURIComponent(next)}` : '';
    return <Navigate to={`/admin/login${query}`} replace />;
  }
  return children ?? <Outlet />;
}

/** Route guard: shows the friendly 403 screen when the permission is missing. */
export function RequirePermission({ permission, children }) {
  const { can } = useAuth();
  if (!can(permission)) return <Forbidden permission={permission} />;
  return children;
}
