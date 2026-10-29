import { Menu } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconChevronDown, IconExternalLink, IconLogout, IconMenu2 } from '@tabler/icons-react';
import { initials } from '@/lib/format';
import { useAuth } from '../auth/AuthContext';
import { roleLabel } from '../lib/permissions';

const menuClasses = { dropdown: 'admin-menu', item: 'admin-menu__item', label: 'admin-menu__label', divider: 'admin-menu__divider' };

export function Topbar({ onOpenMenu, menuOpen }) {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const role = roleLabel(user?.roles?.[0]);

  const signOut = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="admin-topbar">
      <button type="button" className="admin-topbar__menu" onClick={onOpenMenu} aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="admin-mobile-nav">
        <IconMenu2 size={22} stroke={1.75} aria-hidden="true" />
      </button>

      <div className="admin-topbar__spacer" />

      <a className="admin-topbar__site" href="/" target="_blank" rel="noopener noreferrer">
        View site
        <IconExternalLink size={14} stroke={1.75} aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>

      <Menu position="bottom-end" width={260} withinPortal classNames={menuClasses} transitionProps={{ duration: 0 }}>
        <Menu.Target>
          <button type="button" className="admin-user">
            <span className="admin-user__avatar" aria-hidden="true">
              {initials(user?.name) || 'A'}
            </span>
            <span className="admin-user__text">
              <span className="admin-user__name">{user?.name}</span>
              <span className="admin-user__role">{role}</span>
            </span>
            <IconChevronDown size={14} stroke={2} aria-hidden="true" className="admin-user__chevron" />
            <span className="sr-only">Account menu</span>
          </button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            <span className="admin-menu__name">{user?.name}</span>
            <span className="admin-menu__email">{user?.email}</span>
          </Menu.Label>
          <Menu.Divider />
          <Menu.Item leftSection={<IconLogout size={16} stroke={1.75} aria-hidden="true" />} onClick={signOut} disabled={isLoggingOut}>
            Sign out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </header>
  );
}
