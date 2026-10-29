import { renderMarkdown } from '@/lib/markdown';

/** schema.org employmentType for each API `employment_type`. */
const EMPLOYMENT_TYPE = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACTOR',
  contract_to_hire: ['CONTRACTOR', 'FULL_TIME'],
  direct_hire: 'FULL_TIME',
  temporary: 'TEMPORARY',
};

export const mapEmploymentType = (value) => EMPLOYMENT_TYPE[value] ?? 'OTHER';

/** "per year" / "annual" / "monthly" … → schema.org unitText. */
export function mapSalaryPeriod(period = '') {
  const p = String(period).toLowerCase();
  if (p.includes('hour')) return 'HOUR';
  if (p.includes('day')) return 'DAY';
  if (p.includes('week')) return 'WEEK';
  if (p.includes('month')) return 'MONTH';
  return 'YEAR';
}

const list = (items = []) => (items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '');

/** "Dhaka, Bangladesh" with country "Bangladesh" → "Dhaka". */
export function localityOf(job) {
  const location = (job.location ?? '').trim();
  const country = (job.country ?? '').trim();
  if (country && location.toLowerCase().endsWith(`, ${country.toLowerCase()}`)) return location.slice(0, -(country.length + 2)).trim();
  return location;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** HTML description Google expects: body + the structured lists. */
export function jobDescriptionHtml(job) {
  const sections = [
    renderMarkdown(job.description_markdown || job.summary || ''),
    job.responsibilities?.length ? `<h3>Responsibilities</h3>${list(job.responsibilities)}` : '',
    job.requirements?.length ? `<h3>Requirements</h3>${list(job.requirements)}` : '',
    job.nice_to_have?.length ? `<h3>Nice to have</h3>${list(job.nice_to_have)}` : '',
    job.benefits?.length ? `<h3>Benefits</h3>${list(job.benefits)}` : '',
  ];
  return sections.filter(Boolean).join('');
}

/**
 * schema.org JobPosting for a JobDetail payload.
 * `company` = settings.company, `url` = canonical absolute URL of the job page.
 */
export function buildJobPostingJsonLd(job, { company = {}, url, organizationUrl } = {}) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: jobDescriptionHtml(job),
    datePosted: job.published_at,
    employmentType: mapEmploymentType(job.employment_type),
    directApply: true,
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name || 'DIGIT-B',
      ...(organizationUrl ? { sameAs: organizationUrl } : {}),
    },
  };

  if (url) ld.url = url;
  if (job.closes_at) ld.validThrough = job.closes_at;
  if (job.reference_code) {
    ld.identifier = { '@type': 'PropertyValue', name: company.name || 'DIGIT-B', value: job.reference_code };
  }
  if (job.department) ld.occupationalCategory = job.department;

  if (job.work_mode === 'remote') {
    ld.jobLocationType = 'TELECOMMUTE';
    if (job.country) ld.applicantLocationRequirements = { '@type': 'Country', name: job.country };
  }
  if (job.location || job.country) {
    ld.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(job.location ? { addressLocality: localityOf(job) } : {}),
        ...(job.country ? { addressCountry: job.country } : {}),
      },
    };
  }

  const salary = job.salary;
  if (salary && (salary.min != null || salary.max != null) && salary.currency) {
    ld.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: salary.currency,
      value: {
        '@type': 'QuantitativeValue',
        ...(salary.min != null ? { minValue: salary.min } : {}),
        ...(salary.max != null ? { maxValue: salary.max } : {}),
        unitText: mapSalaryPeriod(salary.period),
      },
    };
  }
  return ld;
}

/** schema.org Article for a PostDetail payload. */
export function buildArticleJsonLd(post, { company = {}, url, imageUrl } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': post.type === 'blog' ? 'BlogPosting' : 'Article',
    headline: post.title,
    description: post.excerpt,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Person', name: post.author?.name || company.name || 'DIGIT-B' },
    publisher: { '@type': 'Organization', name: company.name || 'DIGIT-B' },
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(url ? { mainEntityOfPage: { '@type': 'WebPage', '@id': url } } : {}),
  };
}

/** BreadcrumbList; `items` = [{ name, url }]. */
export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
