import { Link } from 'react-router-dom';
import { IconArrowUpRight, IconMapPin, IconStar, IconStarFilled } from '@tabler/icons-react';
import {
  Badge,
  Button,
  CardSkeletons,
  Container,
  CoverImage,
  EmptyState,
  Reveal,
  Section,
  SectionHeader,
} from '@/components/ui';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { ServiceGrid } from '@/components/ui/ServiceCard';
import { ProgramTabs } from '@/components/ui/ProgramTabs';
import { formatDate, initials } from '@/lib/format';

/** Each section reads one slice of the single GET /home payload. */
const slice = (key) => (data) => data[key] ?? [];

export function Solutions({ query }) {
  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Solutions"
            index={3}
            title={
              <>
                Six ways we help you <em>hire with confidence</em>
              </>
            }
            lead="From a single critical hire to a whole engineering function, each service is run by recruiters who know retail supply chain technology."
            actions={
              <Button to="/services" variant="secondary" arrow>
                All services
              </Button>
            }
          />
        </Reveal>
        <QueryBoundary
          query={query}
          select={slice('services')}
          loading={<CardSkeletons count={6} height={260} />}
          errorTitle="We could not load our services"
          empty={<EmptyState title="Services are being updated" description="Please check back shortly, or contact us to discuss your hiring needs." />}
        >
          {(services) => <ServiceGrid services={services} />}
        </QueryBoundary>
      </Container>
    </Section>
  );
}

function Stars({ rating }) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  if (!value) return null;
  return (
    <span className="quote-card__stars" role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < value ? <IconStarFilled key={i} size={16} aria-hidden="true" /> : <IconStar key={i} size={16} aria-hidden="true" />,
      )}
    </span>
  );
}

export function Testimonials({ query }) {
  return (
    <Section tone="ink">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Voices"
            index={5}
            title={
              <>
                What our clients and candidates <em>say</em>
              </>
            }
          />
        </Reveal>
        <QueryBoundary
          query={query}
          select={slice('testimonials')}
          loading={<CardSkeletons count={3} height={280} />}
          errorTitle="We could not load testimonials"
          empty={<EmptyState title="Stories are on their way" description="We are collecting feedback from recent placements." />}
        >
          {(items) => (
            <ul className="quote-grid">
              {items.slice(0, 3).map((item, i) => (
                <Reveal as="li" key={item.id} delay={i * 0.1}>
                  <figure className="quote-card">
                    <Stars rating={item.rating} />
                    <blockquote className="quote-card__text">{item.quote}</blockquote>
                    <figcaption className="quote-card__who">
                      <span className="quote-card__avatar" aria-hidden="true">
                        {item.avatar ? <img src={item.avatar} alt="" loading="lazy" /> : initials(item.name)}
                      </span>
                      <span>
                        <strong className="quote-card__name">{item.name}</strong>
                        <span className="quote-card__role">{[item.role, item.company].filter(Boolean).join(', ')}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </Container>
    </Section>
  );
}

export function MentorshipTeaser({ query }) {
  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Mentorship"
            index={6}
            title={
              <>
                Grow into the industry with <em>a mentor beside you</em>
              </>
            }
            lead="Structured mentoring for career switchers and first-job seekers, and for employers who want temporary and contract specialists productive from week one."
            actions={
              <Button to="/mentorship" variant="secondary" arrow>
                How mentorship works
              </Button>
            }
          />
        </Reveal>
        <QueryBoundary
          query={query}
          select={slice('mentorship_programs')}
          loading={<CardSkeletons count={2} height={420} />}
          errorTitle="We could not load our programmes"
          empty={<EmptyState title="Programmes are being finalised" description="Tell us what you are looking for and we will point you to the right mentor." action={<Button to="/mentorship">Visit the mentorship page</Button>} />}
        >
          {(programs) => <ProgramTabs programs={programs} getHref={(program) => `/mentorship?program=${program.slug}#request`} />}
        </QueryBoundary>
      </Container>
    </Section>
  );
}

export function FeaturedJobs({ query }) {
  return (
    <Section tone="paper-2">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Vacancies"
            index={7}
            title={
              <>
                Roles open <em>right now</em>
              </>
            }
            lead="A selection of live searches. Do not see the right fit? Join our talent pool and we will reach out when it appears."
            actions={
              <Button to="/vacancies" variant="secondary" arrow>
                All vacancies
              </Button>
            }
          />
        </Reveal>
        <QueryBoundary
          query={query}
          select={slice('featured_jobs')}
          loading={<CardSkeletons count={3} height={220} />}
          errorTitle="We could not load vacancies"
          empty={
            <EmptyState
              title="No featured vacancies at the moment"
              description="New searches open every week. Join our talent pool and we will contact you about matching roles."
              action={<Button to="/apply">Join the talent pool</Button>}
            />
          }
        >
          {(jobs) => (
            <ul className="job-teasers">
              {jobs.map((job, i) => (
                <Reveal as="li" key={job.id} delay={i * 0.08}>
                  <Link to={`/vacancies/${job.slug}`} className="job-teaser">
                    <span className="job-teaser__badges">
                      {job.employment_type_label && <Badge tone="ink">{job.employment_type_label}</Badge>}
                      {job.work_mode_label && <Badge>{job.work_mode_label}</Badge>}
                    </span>
                    <h3 className="job-teaser__title">{job.title}</h3>
                    {job.summary && <p className="job-teaser__summary">{job.summary}</p>}
                    <span className="job-teaser__meta">
                      {job.location && (
                        <span className="job-teaser__loc">
                          <IconMapPin size={16} aria-hidden="true" />
                          {place(job)}
                        </span>
                      )}
                      {job.salary?.display && <span className="job-teaser__salary">{job.salary.display}</span>}
                    </span>
                    <span className="job-teaser__more">
                      View role
                      <IconArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </Container>
    </Section>
  );
}

/** "City, Country" without repeating the country when the location already includes it. */
const place = (job) =>
  job.country && !String(job.location).includes(job.country) ? `${job.location}, ${job.country}` : job.location;

const postPath = (post) => `/${post.type === 'blog' ? 'blog' : 'articles'}/${post.slug}`;

export function LatestPosts({ query }) {
  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Insights"
            index={9}
            title={
              <>
                Hiring thinking, <em>straight from the desk</em>
              </>
            }
            actions={
              <Button to="/articles" variant="secondary" arrow>
                All articles
              </Button>
            }
          />
        </Reveal>
        <QueryBoundary
          query={query}
          select={slice('latest_posts')}
          loading={<CardSkeletons count={3} height={340} />}
          errorTitle="We could not load our latest posts"
          empty={<EmptyState title="Fresh articles are coming soon" description="We publish practical notes on hiring and careers in retail supply chain technology." />}
        >
          {(posts) => (
            <ul className="home-posts">
              {posts.map((post, i) => (
                <Reveal as="li" key={post.id} delay={i * 0.08}>
                  <Link to={postPath(post)} className="home-post">
                    <CoverImage src={post.cover_image} alt={post.cover_image_alt || ''} seed={post.slug} ratio="16 / 10" className="home-post__cover" />
                    <span className="home-post__meta">
                      {post.category?.name && <Badge tone="soft">{post.category.name}</Badge>}
                      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                      {post.reading_minutes ? <span>{post.reading_minutes} min read</span> : null}
                    </span>
                    <h3 className="home-post__title">{post.title}</h3>
                    {post.excerpt && <p className="home-post__excerpt">{post.excerpt}</p>}
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </Container>
    </Section>
  );
}
