import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/api/public';
import { legacyServiceSlugs } from '@/config/nav';
import { PageLoader } from '@/components/layout/PageLoader';
import NotFound from '@/pages/NotFound';

/** /eazyrecruitz_jobs/:slug → /vacancies/:slug */
export function LegacyJobRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/vacancies/${slug}`} replace />;
}

/** /eazyrecruitz_service/:slug → /services/:newSlug (unknown → /services) */
export function LegacyServiceRedirect() {
  const { slug } = useParams();
  const target = legacyServiceSlugs[slug];
  return <Navigate to={target ? `/services/${target}` : '/services'} replace />;
}

/**
 * The old site served posts at the root (/why-hiring-…). Resolve the slug via
 * the API and redirect to the canonical /articles/:slug or /blog/:slug.
 */
export function LegacyPostRedirect() {
  const { slug } = useParams();
  const { data, isPending, isError } = useQuery({ ...queries.post(slug), retry: false });

  if (isPending) return <PageLoader />;
  if (isError || !data) return <NotFound />;
  return <Navigate to={`/${data.type === 'blog' ? 'blog' : 'articles'}/${data.slug}`} replace />;
}
