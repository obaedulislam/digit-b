import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconCheck } from '@tabler/icons-react';
import {
  Button,
  Container,
  CoverImage,
  ErrorState,
  Eyebrow,
  Markdown,
  PageHero,
  Reveal,
  Section,
  SectionHeader,
  Seo,
  TextSkeleton,
} from '@/components/ui';
import { CtaBand } from '@/components/ui/CtaBand';
import { ServiceGrid } from '@/components/ui/ServiceCard';
import NotFound from '@/pages/NotFound';
import { queries } from '@/api/public';
import { pad2, siteUrl } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';

const GROUP_LABEL = { solution: 'Solution', hiring_model: 'Hiring model' };

function Related({ current }) {
  const all = useQuery(queries.services());
  const others = (all.data ?? []).filter((s) => s.slug !== current.slug);
  // Same group first, then the rest; only show the section when there is something to show.
  const related = [...others.filter((s) => s.group === current.group), ...others.filter((s) => s.group !== current.group)].slice(0, 3);
  if (all.isPending || all.isError || !related.length) return null;

  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Keep exploring"
            title={
              <>
                Related <em>services</em>
              </>
            }
            actions={
              <Button to="/services" variant="secondary" arrow>
                All services
              </Button>
            }
          />
        </Reveal>
        <ServiceGrid services={related} />
      </Container>
    </Section>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const query = useQuery(queries.service(slug));
  const { settings } = useSettings();

  if (query.isError && query.error?.response?.status === 404) return <NotFound />;

  if (query.isPending || query.isError) {
    return (
      <>
        <Seo title="Service" path={`/services/${slug}`} />
        <Section tone="paper">
          <Container narrow>
            {query.isPending ? (
              <TextSkeleton lines={8} />
            ) : (
              <ErrorState title="We could not load this service" onRetry={() => query.refetch()} />
            )}
          </Container>
        </Section>
      </>
    );
  }

  const service = query.data;
  const steps = service.process_steps ?? [];
  const advantages = service.advantages ?? [];
  const features = service.features ?? [];
  const path = `/services/${service.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.seo?.description || service.summary,
    url: siteUrl(path),
    serviceType: GROUP_LABEL[service.group] ?? 'Recruitment',
    provider: { '@type': 'Organization', name: settings.company.name || 'DIGIT-B', url: siteUrl('/') },
  };

  return (
    <>
      <Seo
        title={service.seo?.title || service.title}
        description={service.seo?.description || service.summary}
        image={service.seo?.og_image || service.image || undefined}
        path={path}
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow={GROUP_LABEL[service.group] ?? 'Service'}
        title={service.title}
        lead={service.summary}
        seed={service.slug}
        crumbs={[{ label: 'Services', to: '/services' }, { label: service.title }]}
        actions={
          <>
            <Button to="/contact?type=hiring" variant="accent" arrow>
              Place a job order
            </Button>
            <Button to="/services" variant="light">
              All services
            </Button>
          </>
        }
      />

      <Section tone="paper">
        <Container className="service-detail">
          <Reveal className="service-detail__main">
            <CoverImage src={service.image} alt={service.image ? service.title : ''} seed={service.slug} ratio="16 / 8" label={GROUP_LABEL[service.group]} />
            {service.body_markdown && <Markdown source={service.body_markdown} />}
          </Reveal>

          <aside className="service-detail__aside" aria-label="At a glance">
            {features.length > 0 && (
              <Reveal className="service-panel" delay={0.1}>
                <Eyebrow>What is included</Eyebrow>
                <ul className="service-panel__list">
                  {features.map((feature) => (
                    <li key={feature}>
                      <IconCheck size={18} stroke={2.25} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button to="/contact?type=hiring" block arrow>
                  Place a job order
                </Button>
                <p className="service-panel__note">
                  Prefer to talk first? <Link to="/contact">Contact a recruiter</Link>.
                </p>
              </Reveal>
            )}
          </aside>
        </Container>
      </Section>

      {steps.length > 0 && (
        <Section tone="paper-2">
          <Container>
            <Reveal>
              <SectionHeader
                eyebrow="How it works"
                index={1}
                title={
                  <>
                    A clear process, <em>step by step</em>
                  </>
                }
              />
            </Reveal>
            <ol className="service-steps">
              {steps.map((step, i) => (
                <Reveal as="li" key={step.title} delay={(i % 4) * 0.08} className="service-steps__item">
                  <span className="service-steps__index" aria-hidden="true">
                    {pad2(i + 1)}
                  </span>
                  <h3 className="service-steps__title">{step.title}</h3>
                  <p>{step.description}</p>
                </Reveal>
              ))}
            </ol>
          </Container>
        </Section>
      )}

      {advantages.length > 0 && (
        <Section tone="ink">
          <Container>
            <Reveal>
              <SectionHeader
                eyebrow="Advantages"
                index={2}
                title={
                  <>
                    Why teams choose <em>this approach</em>
                  </>
                }
              />
            </Reveal>
            <ul className="service-advantages">
              {advantages.map((item, i) => (
                <Reveal as="li" key={item.title} delay={(i % 3) * 0.1} className="service-advantages__item">
                  <h3 className="service-advantages__title">{item.title}</h3>
                  <p>{item.description}</p>
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <Related current={service} />

      <CtaBand
        tone="paper-2"
        seed={`cta-${service.slug}`}
        eyebrow="Ready when you are"
        title={
          <>
            Place a job order <em>today</em>
          </>
        }
        lead="Share the role and the timeline. A recruiter who knows retail supply chain technology will respond within one business day."
        actions={
          <>
            <Button to="/contact?type=hiring" variant="accent" size="lg" arrow>
              Place a job order
            </Button>
            <Button to="/about" variant="light" size="lg">
              About DIGIT-B
            </Button>
          </>
        }
      />
    </>
  );
}
