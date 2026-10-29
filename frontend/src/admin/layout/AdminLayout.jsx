import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Drawer } from '@mantine/core';
import { TextSkeleton } from '@/components/ui';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';

/**
 * Admin shell: ink sidebar + paper content. The sidebar becomes an off-canvas
 * drawer below `lg`. Landmarks: skip link, <aside>/<nav>, <header>, <main>.
 */
export function AdminLayout() {
  const { pathname } = useLocation();
  const main = useRef(null);
  const firstRender = useRef(true);
  const [menu, setMenu] = useState({ open: false, path: pathname });
  // Derived state: the drawer closes by itself when the route changes.
  const menuOpen = menu.open && menu.path === pathname;

  // After navigating, move focus to <main> so keyboard / screen-reader users start at the new content.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="admin-shell">
      <a className="sr-only-focusable" href="#admin-main">
        Skip to main content
      </a>

      <aside className="admin-sidebar" aria-label="Sidebar">
        <SidebarNav idPrefix="desktop" />
      </aside>

      <div className="admin-shell__body">
        <Topbar onOpenMenu={() => setMenu({ open: true, path: pathname })} menuOpen={menuOpen} />
        <main id="admin-main" ref={main} className="admin-main" tabIndex={-1}>
          <Suspense fallback={<div className="admin-page"><TextSkeleton lines={6} /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <Drawer
        opened={menuOpen}
        onClose={() => setMenu((current) => ({ ...current, open: false }))}
        position="left"
        size="min(320px, 86vw)"
        title="Admin menu"
        id="admin-mobile-nav"
        classNames={{ content: 'admin-drawer-nav', header: 'admin-drawer-nav__header', title: 'admin-drawer-nav__title', close: 'admin-drawer-nav__close' }}
      >
        <SidebarNav idPrefix="mobile" onNavigate={() => setMenu((current) => ({ ...current, open: false }))} />
      </Drawer>
    </div>
  );
}
