import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Seo } from '@/components/ui/Seo';

/** Public-site chrome: skip link, header, routed content, footer. */
export function SiteLayout() {
  return (
    <div className="site">
      <Seo />
      <a href="#main" className="sr-only-focusable">
        Skip to content
      </a>
      <Header />
      <main id="main" className="site__main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
