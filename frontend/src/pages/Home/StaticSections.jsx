import { Button, Container, Eyebrow, Reveal, Section, SectionHeader } from '@/components/ui';
import { pad2 } from '@/lib/format';
import { PILLARS, REASONS, WORKING_STYLE } from './content';

export function Mission() {
  return (
    <Section tone="paper" aria-labelledby="mission-title">
      <Container className="home-mission">
        <Reveal className="home-mission__intro">
          <Eyebrow index={1}>Our mission</Eyebrow>
          <h2 id="mission-title" className="home-mission__title">
            Driving <em>Innovation</em> with the Right Talent
          </h2>
          <p className="home-mission__lead">
            Retail supply chains are now software. The people who design, build and run that software are scarce, rarely on job boards, and
            hard to judge from a résumé. We exist to find them, and to match them to teams where they will do their best work.
          </p>
          <Button to="/about" variant="secondary" arrow>
            More about DIGIT-B
          </Button>
        </Reveal>

        <ul className="home-mission__pillars">
          {PILLARS.map((pillar, i) => (
            <Reveal as="li" key={pillar.title} delay={0.1 + i * 0.1} className="home-mission__pillar">
              <span className="home-mission__mark" aria-hidden="true">
                {i === 0 ? '0' : '1'}
              </span>
              <h3 className="home-mission__pillar-title">{pillar.title}</h3>
              <p>{pillar.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function WhyUs() {
  return (
    <Section tone="ink">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Why choose us"
            index={2}
            title={
              <>
                Specialists in one market, <em>so you never start from zero</em>
              </>
            }
            lead="Generalist agencies learn your world on your time. We already know it."
          />
        </Reveal>
        <ul className="home-why">
          {REASONS.map((reason, i) => (
            <Reveal as="li" key={reason.title} delay={(i % 2) * 0.1} className="home-why__item">
              <span className="home-why__index" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <h3 className="home-why__title">{reason.title}</h3>
              <p className="home-why__text">{reason.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function WorkingStyle() {
  return (
    <Section tone="paper-2">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="How we work"
            index={4}
            title={
              <>
                A working style built on <em>trust and clarity</em>
              </>
            }
          />
        </Reveal>
        <ol className="home-steps">
          {WORKING_STYLE.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.12} className="home-steps__item">
              <span className="home-steps__index" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <h3 className="home-steps__title">{step.title}</h3>
              <p className="home-steps__text">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
