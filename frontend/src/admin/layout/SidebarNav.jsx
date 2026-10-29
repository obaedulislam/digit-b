import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/ui';
import { useAuth } from '../auth/AuthContext';
import { NAV_GROUPS } from './nav';

/** Navigation shared by the desktop sidebar and the mobile drawer. Items the user may not open are not rendered. */
export function SidebarNav({ onNavigate, idPrefix = 'nav' }) {
  const { can } = useAuth();
  const groups = NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) })).filter(
    (group) => group.items.length > 0,
  );

  return (
    <div className="admin-sidebar__inner">
      <div className="admin-sidebar__brand">
        <Logo tone="light" to="/admin" />
        <span className="admin-sidebar__tag">Admin</span>
      </div>
      <nav className="admin-nav" aria-label="Admin sections">
        {groups.map((group) => (
          <div key={group.label} className="admin-nav__group">
            <p className="admin-nav__label" id={`${idPrefix}-${group.label}`}>
              {group.label}
            </p>
            <ul className="admin-nav__list" aria-labelledby={`${idPrefix}-${group.label}`}>
              {group.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} className="admin-nav__link" onClick={onNavigate}>
                    <Icon size={18} stroke={1.6} aria-hidden="true" className="admin-nav__icon" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
