import { BinaryTicker, BitText, Button, Container, Eyebrow, NodeField, Reveal } from '@/components/ui';
import { pad2 } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { HERO_POINTS } from './content';

export function Hero() {
  const { settings } = useSettings();
  const tagline = settings.company.tagline || 'Moving beyond 0 and 1 to B-coming digital';

  return (
    <section className="home-hero is-dark" data-surface="dark" aria-labelledby="home-title">
      <NodeField seed="digit-b-home" nodes={38} packets={5} className="home-hero__art" />

      <Container className="home-hero__inner">
        <Reveal className="home-hero__copy" y={32}>
          <Eyebrow>Retail supply chain tech recruitment</Eyebrow>
          <h1 id="home-title" className="home-hero__title">
            Unlock top <em>talent</em> in retail supply chain technology
          </h1>
          <p className="home-hero__lead">
            DIGIT-B finds and places the engineers, data specialists and technology leaders who build what retail runs on.
          </p>
          <div className="home-hero__actions">
            <Button to="/contact?type=hiring" variant="accent" size="lg" arrow>
              Find your next leader
            </Button>
            <Button to="/apply" variant="light" size="lg">
              Explore our talent pool
            </Button>
          </div>
          <p className="home-hero__tagline">
            <BitText>{tagline}</BitText>
          </p>
        </Reveal>

        <ul className="home-hero__points">
          {HERO_POINTS.map((point, i) => (
            <Reveal as="li" key={point.title} delay={0.15 + i * 0.1} className="home-hero__point">
              <span className="home-hero__index" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <h2 className="home-hero__point-title">{point.title}</h2>
              <p className="home-hero__point-text">{point.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <BinaryTicker className="home-hero__ticker" />
    </section>
  );
}
