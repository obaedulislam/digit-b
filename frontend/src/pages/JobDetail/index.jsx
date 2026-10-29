import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconBriefcase, IconCoin, IconMapPin } from '@tabler/icons-react';
import { Badge, Button, Container, ErrorState, FormAlert, PageHero, Reveal, Section, Seo, TextSkeleton } from '@/components/ui';
import { ShareLinks } from '@/components/ui/ShareLinks';
import NotFound from '@/pages/NotFound';
import { JobCard } from '@/pages/Vacancies/JobCard';
import { JobsCta } from '@/pages/Vacancies/JobsCta';
import { isNotFound, isPast, jobPlace } from '@/pages/Vacancies/jobMeta';
import { queries } from '@/api/public';
import { useSettings } from '@/hooks/useSettings';
import { stripSiteName } from '@/lib/seoTitle';
import { formatDate, pad2, siteUrl } from '@/lib/format';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd } from '@/lib/jsonld';
import { Markdown } from '@/components/ui/Markdown';

const LIST_SECTIONS = [
  { key: 'responsibilities', title: 'Responsibilities' },
  { key: 'requirements', title: 'Requirements' },
  { key: 'nice_to_have', title: 'Nice to have' },
  { key: 'benefits', title: 'Benefits' },
];

export default function JobDetail() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const query = useQuery({
    ...queries.job(slug),
    retry: (count, error) => !isNotFound(error) && count < 2,
  });

  if (query.isPending) {
    return (
      <>
        <Seo title="Vacancy" noindex />
        <Section tone="paper">
          <Container narrow>
            <TextSkeleton lines={8} />
          </Container>
        </Section>
      </>
    );
  }

  if (query.isError) {
    if (isNotFound(query.error)) return <NotFound />;
    return (
      <>
        <Seo title="Vacancy" noindex />
        <Section tone="paper">
          <Container>
            <ErrorState title="We could not load this role" onRetry={() => query.refetch()} />
          </Container>
        </Section>
      </>
    );
  }

  const job = query.data;
  const path = `/vacancies/${job.slug}`;
  const closed = isPast(job.closes_at);
  const place = jobPlace(job);
  const related = (job.related ?? []).filter((item) => item.slug !== job.slug);

  const facts = [
    job.salary?.display && ['Salary', job.salary.display],
    job.experience?.display && ['Experience', job.experience.display],
    job.employment_type_label && ['Employment', job.employment_type_label],
    job.work_mode_label && ['Work mode', job.work_mode_label],
    place && ['Location', place],
    job.department && ['Department', job.department],
    job.reference_code && ['Reference', job.reference_code],
    job.published_at && ['Posted', formatDate(job.published_at)],
    job.closes_at && [closed ? 'Closed' : 'Closes', formatDate(job.closes_at)],
  ].filter(Boolean);

  const sections = [
    job.description_markdown && { id: 'about', title: null, node: <Markdown source={job.description_markdown} /> },
    ...LIST_SECTIONS.filter(({ key }) => job[key]?.length).map(({ key, title }) => ({
      id: key,
      title,
      node: (
        <ul className="checklist">
          {job[key].map((item) => (
            <li key={item} className="checklist__item">
              {item}
            </li>
          ))}
        </ul>
      ),
    })),
  ].filter(Boolean);

  const applyHref = `/apply?job=${encodeURIComponent(job.slug)}`;
  const jsonLd = [
    buildJobPostingJsonLd(job, { company: settings.company, url: siteUrl(path), organizationUrl: siteUrl('/') }),
    buildBreadcrumbJsonLd([
      { name: 'Home', url: siteUrl('/') },
      { name: 'Vacancies', url: siteUrl('/vacancies') },
      { name: job.title, url: siteUrl(path) },
    ]),
  ];

  return (
    <>
      <Seo
        title={stripSiteName(job.seo?.title, settings.company.name) || `${job.title}${job.location ? ` — ${job.location}` : ''}`}
        description={job.seo?.description || job.summary}
        image={job.seo?.og_image}
        path={path}
        jsonLd={jsonLd}
      />

      <PageHero
        className="job-hero"
        eyebrow={job.reference_code ? `Ref ${job.reference_code}` : 'Vacancy'}
        title={job.title}
        lead={job.summary}
        crumbs={[{ label: 'Vacancies', to: '/vacancies' }, { label: job.title }]}
        actions={
          closed ? (
            <Button to="/vacancies" variant="accent" arrow>
              Browse open roles
            </Button>
          ) : (
            <Button to={applyHref} variant="accent" size="lg" arrow>
              Apply for this role
            </Button>
          )
        }
        seed={job.slug}
      >
        <ul className="job-hero__facts">
          {job.employment_type_label && (
            <li>
              <Badge tone="accent">{job.employment_type_label}</Badge>
            </li>
          )}
          {job.work_mode_label && (
            <li>
              <Badge>{job.work_mode_label}</Badge>
            </li>
          )}
          {place && (
            <li className="job-hero__fact">
              <IconMapPin size={16} stroke={1.75} aria-hidden="true" />
              {place}
            </li>
          )}
          {job.salary?.display && (
            <li className="job-hero__fact">
              <IconCoin size={16} stroke={1.75} aria-hidden="true" />
              {job.salary.display}
            </li>
          )}
          {job.experience?.display && (
            <li className="job-hero__fact">
              <IconBriefcase size={16} stroke={1.75} aria-hidden="true" />
              {job.experience.display}
            </li>
          )}
        </ul>
      </PageHero>

      <Section tone="paper" className="job-detail">
        <Container>
          <div className="job-detail__layout">
            <div className="job-detail__main">
              {closed && (
                <FormAlert tone="error" title="This role has closed">
                  Applications are no longer being accepted for this position. You can still send your CV and we will contact you when something similar opens.
                </FormAlert>
              )}

              {sections.map((section, index) => (
                <Reveal key={section.id} as="section" className="job-section" aria-labelledby={section.title ? `job-${section.id}` : undefined}>
                  {section.title && (
                    <>
                      <p className="job-section__index" aria-hidden="true">
                        {pad2(sections.slice(0, index).filter((item) => item.title).length + 1)}
                      </p>
                      <h2 className="job-section__title" id={`job-${section.id}`}>
                        {section.title}
                      </h2>
                    </>
                  )}
                  {section.node}
                </Reveal>
              ))}

              {sections.length === 0 && <p className="job-detail__empty">The full description for this role is coming soon. Apply and we will share the details directly.</p>}
            </div>

            <aside className="job-aside" aria-label="Job summary">
              <div className="job-aside__card">
                {job.salary?.display ? (
                  <p className="job-aside__salary">{job.salary.display}</p>
                ) : (
                  <p className="job-aside__salary job-aside__salary--muted">{job.employment_type_label || 'Vacancy'}</p>
                )}
                <dl className="job-aside__facts">
                  {facts
                    .filter(([label]) => label !== 'Salary')
                    .map(([label, value]) => (
                      <div key={label} className="job-aside__fact">
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                {closed ? (
                  <Button to="/apply" block arrow>
                    Send your CV anyway
                  </Button>
                ) : (
                  <Button to={applyHref} block arrow>
                    Apply for this role
                  </Button>
                )}
                <ShareLinks path={path} title={`${job.title} — ${settings.company.name}`} className="job-aside__share" />
              </div>
              <p className="job-aside__note">
                Questions about this role? <Link to="/contact?type=candidate">Talk to a recruiter</Link>.
              </p>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="paper-2" className="job-related">
          <Container>
            <Reveal>
              <h2 className="job-related__title">
                Similar <em>roles</em>
              </h2>
            </Reveal>
            <ul className="job-related__grid">
              {related.map((item) => (
                <li key={item.id}>
                  <JobCard job={item} compact />
                </li>
              ))}
            </ul>
            <div className="job-related__more">
              <Button to="/vacancies" variant="secondary" arrow>
                All vacancies
              </Button>
            </div>
          </Container>
        </Section>
      )}

      <JobsCta
        title={
          <>
            Know someone <em>perfect</em> for this?
          </>
        }
        text="Share the role with them above, or send your own CV and we will keep you in mind for future openings."
      />
    </>
  );
}
