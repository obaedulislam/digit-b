/** Single source for header, mobile drawer and footer navigation. */
export const primaryNav = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Vacancies', to: '/vacancies' },
  { label: 'Mentorship', to: '/mentorship' },
  { label: 'Articles', to: '/articles' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

export const headerCta = { label: 'Apply now', to: '/apply' };

export const footerNav = [
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'Mentorship', to: '/mentorship' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Candidates',
    links: [
      { label: 'Vacancies', to: '/vacancies' },
      { label: 'Apply now', to: '/apply' },
      { label: 'Articles', to: '/articles' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Employers',
    links: [
      { label: 'Temporary staffing', to: '/services/temporary-staffing' },
      { label: 'Direct hire', to: '/services/direct-hire' },
      { label: 'Executive search', to: '/services/executive-search' },
      { label: 'Place a job order', to: '/contact?type=hiring' },
    ],
  },
];

export const legalNav = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

/** Old WordPress paths → new routes (kept so inbound links and SEO survive). */
export const legacyRedirects = [
  { from: '/about-us', to: '/about' },
  { from: '/contact-us', to: '/contact' },
  { from: '/apply-now', to: '/apply' },
  { from: '/apply-now-temp', to: '/apply' },
  { from: '/about-us-temp', to: '/about' },
  { from: '/coming-soon', to: '/' },
  { from: '/temporary-staffing', to: '/services/temporary-staffing' },
  { from: '/direct-hire', to: '/services/direct-hire' },
  { from: '/category/latest-news', to: '/articles' },
  { from: '/category/our-blog', to: '/blog' },
  { from: '/jobs_cat/:category', to: '/vacancies' },
];

/** Old CPT slug → new service slug. Unknown slugs fall back to /services. */
export const legacyServiceSlugs = {
  temporary: 'temporary-staffing',
  'temporary-2': 'temporary-staffing',
  'direct-hire': 'direct-hire',
  'direct-hire-2': 'direct-hire',
  contract: 'contract',
  'contract-2': 'contract',
  payrolling: 'payrolling',
  training: 'training',
  'executive-search': 'executive-search',
};
