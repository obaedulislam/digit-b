import { IconAdjustmentsHorizontal, IconBuildingWarehouse, IconCrown, IconWorld } from '@tabler/icons-react';
import { BitText, Button, Container, Eyebrow, PageHero, Reveal, Section, SectionHeader, Seo } from '@/components/ui';
import { CtaBand } from '@/components/ui/CtaBand';
import { FaqList } from '@/components/ui/FaqList';
import { StatsBand } from '@/components/ui/StatsBand';
import { pad2 } from '@/lib/format';
import { useSettings } from '@/hooks/useSettings';
import { REASONS, WORKING_STYLE } from '@/pages/Home/content';

const SPECIALTIES = [
  {
    title: 'Executive Search',
    text: 'Confidential, retained searches for CTOs, VPs of Engineering and heads of supply chain technology, led by people who have sat across the table from them before.',
    Icon: IconCrown,
  },
  {
    title: 'Global Talent Network',
    text: 'A relationship-led network of engineers, data specialists and product leaders across regions, built over years rather than scraped from job boards.',
    Icon: IconWorld,
  },
  {
    title: 'Industry Expertise',
    text: 'We focus on retail, e-commerce and logistics technology, so we understand the systems, the vocabulary and the pressure of peak season.',
    Icon: IconBuildingWarehouse,
  },
  {
    title: 'Customized Recruitment',
    text: 'Direct hire, contract, temporary staffing or payrolling: each engagement is shaped around your timeline, budget and team.',
    Icon: IconAdjustmentsHorizontal,
  },
];

export default function About() {
  const { settings } = useSettings();

  return (
    <>
      <Seo
        title="About us"
        path="/about"
        description="DIGIT-B is a specialist recruitment firm for retail supply chain technology, with over a decade of experience connecting engineers, data specialists and technology leaders with the teams that need them."
      />

      <PageHero
        eyebrow="About DIGIT-B"
        title={
          <>
            <BitText>Moving beyond 0 and 1 to</BitText> <em>B-coming</em> digital
          </>
        }
        lead={
          settings.company.description ||
          'DIGIT-B is a recruitment firm for headhunting and talent acquisition in retail supply chain technology.'
        }
        crumbs={[{ label: 'About' }]}
        actions={
          <>
            <Button to="/contact?type=hiring" variant="accent" arrow>
              Talk to us about hiring
            </Button>
            <Button to="/apply" variant="light">
              Join our talent pool
            </Button>
          </>
        }
      />

      <Section tone="paper" aria-labelledby="about-mission">
        <Container className="about-split">
          <Reveal className="about-split__lead">
            <Eyebrow index={1}>Our mission</Eyebrow>
            <h2 id="about-mission" className="about-title">
              Driving <em>innovation</em> with the right talent
            </h2>
          </Reveal>
          <Reveal className="about-split__body" delay={0.1}>
            <p className="about-prose about-prose--lead">
              Retail supply chains now run on software, and the people who build and operate that software decide how fast a retailer can move.
            </p>
            <p className="about-prose">
              We exist to connect those people with the teams that need them. We empower innovation by placing engineers, data specialists and
              technology leaders who have already solved the problems our clients are hiring for, and we drive growth by making each placement
              last.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper-2">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Why DIGIT-B"
              index={2}
              title={
                <>
                  Four reasons clients <em>stay with us</em>
                </>
              }
            />
          </Reveal>
          <ul className="about-reasons">
            {REASONS.map((reason, i) => (
              <Reveal as="li" key={reason.title} delay={(i % 2) * 0.1} className="about-reasons__item">
                <span className="about-reasons__index" aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <h3 className="about-reasons__title">{reason.title}</h3>
                <p>{reason.text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ink" aria-labelledby="about-story">
        <Container className="about-split">
          <Reveal className="about-split__lead">
            <Eyebrow index={3}>Our story</Eyebrow>
            <h2 id="about-story" className="about-title">
              Welcome to <em>DIGIT-B</em>
            </h2>
          </Reveal>
          <Reveal className="about-split__body" delay={0.1}>
            <p className="about-prose about-prose--lead">
              With over a decade of experience in retail supply chain technology, our founder saw the same problem from both sides of the table.
            </p>
            <p className="about-prose">
              Companies could not find people who understood their platforms, and talented specialists could not find employers who understood
              their craft. Generalist agencies treated both as keywords.
            </p>
            <p className="about-prose">
              DIGIT-B was built to close that gap: a recruiter-led firm that speaks the language of warehouse, order and planning systems, and
              that treats every search as a relationship rather than a transaction. The name is our promise, to help people and companies move
              beyond 0 and 1 and become digital.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Our plan"
              index={4}
              title={
                <>
                  Three steps from brief to <em>a hire that sticks</em>
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

      <Section tone="paper-2">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="What we do best"
              index={5}
              title={
                <>
                  Four specialties, <em>one standard</em>
                </>
              }
              lead="Whatever the engagement model, these are the strengths you are hiring."
            />
          </Reveal>
          <ul className="about-specialties">
            {SPECIALTIES.map(({ title, text, Icon }, i) => (
              <Reveal as="li" key={title} delay={(i % 2) * 0.1} className="about-specialties__item">
                <span className="about-specialties__icon" aria-hidden="true">
                  <Icon size={26} stroke={1.5} />
                </span>
                <h3 className="about-specialties__title">{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <StatsBand tone="ink" />

      <Section tone="paper" aria-labelledby="about-faq">
        <Container className="about-faq">
          <Reveal className="about-faq__intro">
            <Eyebrow index={6}>Questions</Eyebrow>
            <h2 id="about-faq" className="about-title">
              Frequently <em>asked</em>
            </h2>
            <p className="about-prose">Cannot find your answer? Send us a note and a recruiter will reply within one business day.</p>
            <Button to="/contact" variant="secondary" arrow>
              Contact us
            </Button>
          </Reveal>
          <FaqList group="about" />
        </Container>
      </Section>

      <CtaBand
        tone="paper-2"
        seed="about-cta"
        eyebrow="Next step"
        title={
          <>
            Ready to build your team, <em>or your next chapter?</em>
          </>
        }
        lead="Tell us about the role you need to fill or the role you want to land."
        actions={
          <>
            <Button to="/contact?type=hiring" variant="accent" size="lg" arrow>
              Place a job order
            </Button>
            <Button to="/apply" variant="light" size="lg">
              Apply now
            </Button>
          </>
        }
      />
    </>
  );
}
