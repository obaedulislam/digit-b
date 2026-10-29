import { describe, expect, it } from 'vitest';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildJobPostingJsonLd, localityOf, mapEmploymentType, mapSalaryPeriod } from './jsonld';
import { addTags, removeTag } from './tags';

const job = {
  title: 'Software Engineer',
  slug: 'software-engineer',
  reference_code: '2019ER',
  summary: 'Build things.',
  description_markdown: '## About\n\nHello **world**',
  responsibilities: ['Build <services>'],
  requirements: [],
  nice_to_have: [],
  benefits: ['Learning budget'],
  department: 'Engineering',
  employment_type: 'contract_to_hire',
  work_mode: 'hybrid',
  location: 'Dhaka, Bangladesh',
  country: 'Bangladesh',
  salary: { min: 85000, max: 90000, currency: 'USD', period: 'year', display: '$85,000 – $90,000 / year' },
  published_at: '2026-10-26T15:26:39Z',
  closes_at: '2026-12-01T00:00:00Z',
};

describe('JobPosting JSON-LD', () => {
  const ld = buildJobPostingJsonLd(job, { company: { name: 'DIGIT-B' }, url: 'https://x.test/vacancies/software-engineer' });

  it('has the required Google fields', () => {
    expect(ld['@type']).toBe('JobPosting');
    expect(ld).toMatchObject({ title: 'Software Engineer', datePosted: job.published_at, validThrough: job.closes_at });
    expect(ld.hiringOrganization).toMatchObject({ '@type': 'Organization', name: 'DIGIT-B' });
    expect(ld.jobLocation.address).toMatchObject({ addressLocality: 'Dhaka', addressCountry: 'Bangladesh' });
  });

  it('maps employment type, salary and escapes list items', () => {
    expect(ld.employmentType).toEqual(['CONTRACTOR', 'FULL_TIME']);
    expect(mapEmploymentType('direct_hire')).toBe('FULL_TIME');
    expect(mapEmploymentType('weird')).toBe('OTHER');
    expect(ld.baseSalary).toMatchObject({ currency: 'USD', value: { minValue: 85000, maxValue: 90000, unitText: 'YEAR' } });
    expect(mapSalaryPeriod('per month')).toBe('MONTH');
    expect(ld.description).toContain('<strong>world</strong>');
    expect(ld.description).toContain('Build &lt;services&gt;');
    expect(ld.description).not.toContain('Requirements');
  });

  it('omits salary when hidden and marks remote roles', () => {
    const hidden = buildJobPostingJsonLd({ ...job, salary: null, work_mode: 'remote' }, {});
    expect(hidden.baseSalary).toBeUndefined();
    expect(hidden.jobLocationType).toBe('TELECOMMUTE');
    expect(localityOf({ location: 'Dublin', country: 'Ireland' })).toBe('Dublin');
  });
});

describe('Article + breadcrumb JSON-LD', () => {
  it('builds Article/BlogPosting and numbered breadcrumbs', () => {
    expect(buildArticleJsonLd({ type: 'article', title: 'T', published_at: 'd', author: { name: 'A' } })['@type']).toBe('Article');
    expect(buildArticleJsonLd({ type: 'blog', title: 'T', published_at: 'd' })['@type']).toBe('BlogPosting');
    const crumbs = buildBreadcrumbJsonLd([
      { name: 'Home', url: 'u1' },
      { name: 'Jobs', url: 'u2' },
    ]);
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});

describe('tag helpers', () => {
  it('adds, splits, de-duplicates and caps tags', () => {
    expect(addTags(['SQL'], 'sql, Java ,  , Go')).toEqual(['SQL', 'Java', 'Go']);
    expect(addTags([], 'a,b,c', { max: 2 })).toEqual(['a', 'b']);
    expect(addTags([], 'x'.repeat(60), { maxLength: 40 })[0]).toHaveLength(40);
    expect(removeTag(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
});
