import { useQuery } from '@tanstack/react-query';
import { queries } from '@/api/public';

// Safe shape so the shell renders even while settings load or the API is down.
// Intentionally contains NO contact data — that lives only in the database.
const EMPTY = {
  company: { name: 'DIGIT-B', tagline: '', description: '' },
  contact: { email: '', phone: '', address_lines: [], hours: [], map_url: null },
  social: {},
  stats: [],
  seo: { site_title: '', default_description: '', og_image: null },
};

/** Site-wide settings (company, contact, social, stats, SEO defaults). */
export function useSettings() {
  const query = useQuery(queries.settings());
  const data = query.data ? { ...EMPTY, ...query.data } : EMPTY;
  return { ...query, settings: data };
}

/** `tel:` href from a human phone string. */
export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;
