import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Drawer } from '@mantine/core';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { primaryNav, headerCta } from '@/config/nav';
import { cx } from '@/lib/cx';

export function Header() {
  const { pathname } = useLocation();
  // The drawer is "open for a given path": navigating changes the path, which
  // closes it with no effect needed.
  const [openPath, setOpenPath] = useState(null);
  const open = openPath === pathname;
  const setOpen = (value) => setOpenPath(value ? pathname : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cx('header', scrolled && 'is-scrolled')}>
      <div className="container header__inner">
        <Logo />

        <nav className="header__nav" aria-label="Primary">
          <ul className="header__list">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => cx('header__link', isActive && 'is-active')}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <Button to={headerCta.to} size="sm" variant="primary" arrow className="header__cta">
            {headerCta.label}
          </Button>
          <button
            type="button"
            className="header__burger"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <IconMenu2 size={24} stroke={1.75} />
          </button>
        </div>
      </div>

      <Drawer
        id="mobile-nav"
        opened={open}
        onClose={() => setOpen(false)}
        position="right"
        size="min(24rem, 100%)"
        withCloseButton={false}
        trapFocus
        title={null}
        transitionProps={{ duration: 260 }}
      >
        <div className="mobile-nav">
          <div className="mobile-nav__top">
            <Logo tone="light" />
            <button type="button" className="mobile-nav__close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <IconX size={24} stroke={1.75} />
            </button>
          </div>
          <nav aria-label="Mobile">
            <ul className="mobile-nav__list">
              {[{ label: 'Home', to: '/' }, ...primaryNav].map((item, i) => (
                <li key={item.to} style={{ '--i': i }}>
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => cx('mobile-nav__link', isActive && 'is-active')}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <Button to={headerCta.to} variant="accent" size="lg" block arrow>
            {headerCta.label}
          </Button>
        </div>
      </Drawer>
    </header>
  );
}
