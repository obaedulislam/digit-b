import { useQuery } from '@tanstack/react-query';
import { Button, CardSkeletons, Container, EmptyState, ErrorState, PageHero, Reveal, Section, SectionHeader, Seo } from '@/components/ui';
import { CtaBand } from '@/components/ui/CtaBand';
import { ServiceGrid } from '@/components/ui/ServiceCard';
import { queries } from '@/api/public';
import { siteUrl } from '@/lib/format';

const GROUPS = [
  {
    key: 'solution',
    tone: 'paper',
    eyebrow: 'Solutions',
    title: (
      <>
        What we do <em>for hiring teams</em>
      </>
    ),
    lead: 'Specialist services that cover the whole talent journey, from market intelligence to the signed offer.',
  },
  {
    key: 'hiring_model',
    tone: 'paper-2',
    eyebrow: 'Hiring models',
    title: (
      <>
        Flexible ways <em>to engage talent</em>
      </>
    ),
    lead: 'Choose the structure that fits the role, the budget and the timeline. We can move between models as your needs change.',
  },
];

/** Splits the flat service list by `group`; unknown groups are listed with solutions. */
const groupServices = (services) => {
  const hiring = services.filter((s) => s.group === 'hiring_model');
  return { solution: services.filter((s) => s.group !== 'hiring_model'), hiring_model: hiring };
};

export default function Services() {
  const query = useQuery(queries.services());

  return (
    <>
      <Seo
        title="Services"
        path="/services"
        description="Talent acquisition, sourcing, candidate matching, executive search and flexible hiring models for retail supply chain technology."
        jsonLd={
          query.data?.length
            ? {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                itemListElement: query.data.map((s, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: s.title,
                  url: siteUrl(`/services/${s.slug}`),
                })),
              }
            : undefined
        }
      />
      <PageHero
        eyebrow="Services"
        title={
          <>
            Recruitment built for <em>retail supply chain tech</em>
          </>
        }
        lead="From a single critical hire to a whole engineering function, choose a solution or a hiring model and we will shape it around your team."
        crumbs={[{ label: 'Services' }]}
        actions={
          <Button to="/contact?type=hiring" variant="accent" arrow>
            Place a job order
          </Button>
        }
      />

      {query.isPending && (
        <Section tone="paper">
          <Container>
            <CardSkeletons count={6} height={260} />
          </Container>
        </Section>
      )}

      {query.isError && (
        <Section tone="paper">
          <Container>
            <ErrorState title="We could not load our services" onRetry={() => query.refetch()} />
          </Container>
        </Section>
      )}

      {query.isSuccess && query.data.length === 0 && (
        <Section tone="paper">
          <Container>
            <EmptyState title="Services are being updated" description="Please check back shortly, or contact us to discuss your hiring needs." action={<Button to="/contact?type=hiring">Contact us</Button>} />
          </Container>
        </Section>
      )}

      {query.isSuccess &&
        GROUPS.map((group, index) => {
          const items = groupServices(query.data)[group.key];
          if (!items.length) return null;
          return (
            <Section key={group.key} tone={group.tone}>
              <Container>
                <Reveal>
                  <SectionHeader
                    eyebrow={group.eyebrow}
                    index={index + 1}
                    title={group.title}
                    lead={group.lead}
                  />
                </Reveal>
                <ServiceGrid services={items} />
              </Container>
            </Section>
          );
        })}

      <CtaBand
        tone="paper"
        seed="services-cta"
        eyebrow="Not sure which fits?"
        title={
          <>
            Tell us the role, <em>we will recommend the route</em>
          </>
        }
        lead="A short conversation is usually enough to choose between direct hire, contract, temporary staffing and executive search."
        actions={
          <>
            <Button to="/contact?type=hiring" variant="accent" size="lg" arrow>
              Place a job order
            </Button>
            <Button to="/vacancies" variant="light" size="lg">
              Browse vacancies
            </Button>
          </>
        }
      />
    </>
  );
}
