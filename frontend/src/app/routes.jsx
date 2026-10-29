import { Navigate, createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { RouteError } from '@/components/layout/RouteError';
import { PageLoader } from '@/components/layout/PageLoader';
import { LegacyJobRedirect, LegacyPostRedirect, LegacyServiceRedirect } from './legacy';
import { legacyRedirects } from '@/config/nav';

/** Route-level code splitting: each page is its own chunk. */
const page = (load) => ({
  lazy: async () => {
    const module = await load();
    return { Component: module.default };
  },
});

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      { index: true, ...page(() => import('@/pages/Home')) },
      { path: 'about', ...page(() => import('@/pages/About')) },
      { path: 'services', ...page(() => import('@/pages/Services')) },
      { path: 'services/:slug', ...page(() => import('@/pages/ServiceDetail')) },
      { path: 'vacancies', ...page(() => import('@/pages/Vacancies')) },
      { path: 'vacancies/:slug', ...page(() => import('@/pages/JobDetail')) },
      { path: 'apply', ...page(() => import('@/pages/Apply')) },
      { path: 'articles', ...page(() => import('@/pages/Articles')) },
      { path: 'articles/:slug', ...page(() => import('@/pages/PostDetail')) },
      { path: 'blog', ...page(() => import('@/pages/Blog')) },
      { path: 'blog/:slug', ...page(() => import('@/pages/PostDetail')) },
      { path: 'mentorship', ...page(() => import('@/pages/Mentorship')) },
      { path: 'contact', ...page(() => import('@/pages/Contact')) },
      { path: 'privacy', ...page(() => import('@/pages/Privacy')) },
      { path: 'terms', ...page(() => import('@/pages/Terms')) },
      { path: 'unsubscribe', ...page(() => import('@/pages/Unsubscribe')) },

      // ── legacy WordPress URLs (see docs/01-audit.md) ──
      ...legacyRedirects.map(({ from, to }) => ({
        path: from.replace(/^\//, ''),
        element: <Navigate to={to} replace />,
      })),
      { path: 'eazyrecruitz_jobs/:slug', element: <LegacyJobRedirect /> },
      { path: 'eazyrecruitz_service/:slug', element: <LegacyServiceRedirect /> },
      { path: ':slug', element: <LegacyPostRedirect /> },

      { path: '*', ...page(() => import('@/pages/NotFound')) },
    ],
  },
  // Admin dashboard: separate lazy chunk with its own layout and routes.
  { path: '/admin/*', ...page(() => import('@/admin/AdminApp')), errorElement: <RouteError /> },
]);
