import { useQuery } from '@tanstack/react-query';
import { Container, Eyebrow, NodeField, Reveal, Section, Seo } from '@/components/ui';
import { StatsBand } from '@/components/ui/StatsBand';
import { NewsletterForm } from '@/components/layout/NewsletterForm';
import { queries } from '@/api/public';
import { siteUrl } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { Hero } from './Hero';
import { Mission, WhyUs, WorkingStyle } from './StaticSections';
import { FeaturedJobs, LatestPosts, MentorshipTeaser, Solutions, Testimonials } from './DataSections';
import { ContactSection } from './ContactSection';

function NewsletterBand() {
  return (
    <Section tone="paper-2" className="cta-section">
      <Container>
        <Reveal className="home-news is-dark" data-surface="dark">
          <NodeField seed="newsletter-band" nodes={20} packets={2} className="home-news__art" />
          <div className="home-news__copy">
            <Eyebrow>Newsletter</Eyebrow>
            <h2 className="home-news__title">
              Hiring insights, <em>monthly</em>
            </h2>
            <p className="home-news__lead">Market notes, salary signals and career advice for retail supply chain technology. No spam.</p>
          </div>
          <div className="home-news__form">
            <NewsletterForm id="home-newsletter" />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export default function Home() {
  const { settings } = useSettings();
  const home = useQuery(queries.home());
  const { company, contact, social } = settings;

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name || 'DIGIT-B',
    url: siteUrl('/'),
    description: company.description || undefined,
    email: contact.email || undefined,
    telephone: contact.phone || undefined,
    address: contact.address_lines?.length
      ? { '@type': 'PostalAddress', streetAddress: contact.address_lines.join(', ') }
      : undefined,
    sameAs: Object.values(social ?? {}).filter(Boolean),
  };

  return (
    <>
      <Seo
        path="/"
        description="DIGIT-B is a recruitment firm for headhunting and talent acquisition in retail supply chain technology: direct hire, contract, temporary staffing and executive search."
        jsonLd={organization}
      />
      <Hero />
      <StatsBand tone="paper-2" />
      <Mission />
      <WhyUs />
      <Solutions query={home} />
      <WorkingStyle />
      <Testimonials query={home} />
      <MentorshipTeaser query={home} />
      <FeaturedJobs query={home} />
      <ContactSection />
      <LatestPosts query={home} />
      <NewsletterBand />
    </>
  );
}
