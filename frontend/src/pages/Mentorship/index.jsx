import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { IconBuildingStore, IconUserCheck } from '@tabler/icons-react';
import { Button, CardSkeletons, Container, EmptyState, Eyebrow, PageHero, Reveal, Section, SectionHeader, Seo } from '@/components/ui';
import { FaqList } from '@/components/ui/FaqList';
import { ProgramTabs } from '@/components/ui/ProgramTabs';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { queries } from '@/api/public';
import { pad2 } from '@/lib/format';
import { RequestForm } from './RequestForm';
import { mentorshipInitialValues, mentorshipRules } from './mentorshipRules';

const AUDIENCES = [
  {
    title: 'Individuals',
    Icon: IconUserCheck,
    lead: 'Career switchers and first-job seekers',
    points: [
      'Technologists from other industries who want to move into retail supply chain technology',
      'Graduates and early-career engineers looking for a strong first role',
      'Anyone who wants an honest view of the market from people who hire in it',
    ],
  },
  {
    title: 'Employers',
    Icon: IconBuildingStore,
    lead: 'Teams that bring in temporary and contract specialists',
    points: [
      'Hiring managers who need short-term specialists productive in days, not months',
      'Teams that want structured onboarding and knowledge transfer for every engagement',
      'Organisations evaluating contractors for permanent roles',
    ],
  },
];

const STEPS = [
  { title: 'Choose a programme', text: 'Pick the tier and programme that matches your goal. Not sure? Tell us about it in the request form.' },
  { title: 'Tell us your goal', text: 'Share your background and what you want to achieve so we can match you with the right mentor.' },
  { title: 'Meet your mentor', text: 'A practitioner from retail supply chain technology agrees a plan with you and starts the sessions.' },
  { title: 'Build and review', text: 'Regular check-ins, practical assignments and honest feedback keep progress visible until you reach the goal.' },
];

export default function Mentorship() {
  const [searchParams] = useSearchParams();
  const programsQuery = useQuery(queries.mentorshipPrograms());

  const form = useForm({
    mode: 'controlled',
    initialValues: mentorshipInitialValues(searchParams.get('program') ?? ''),
    validate: mentorshipRules,
  });

  const choose = (program) => {
    form.setFieldValue('program', program.slug);
    document.getElementById('request')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    window.setTimeout(() => document.getElementById('mentor-program')?.focus({ preventScroll: true }), 450);
  };

  return (
    <>
      <Seo
        title="Mentorship"
        path="/mentorship"
        description="Mentorship for career switchers, first-job seekers and employers in retail supply chain technology, led by practitioners who hire in the industry."
      />

      <PageHero
        eyebrow="Mentorship"
        title={
          <>
            A mentor who has <em>already</em> done the job
          </>
        }
        lead="Structured one-to-one mentoring for people entering retail supply chain technology, and for employers who want their specialists to land well."
        crumbs={[{ label: 'Mentorship' }]}
        actions={
          <>
            <Button href="#programs" variant="accent" arrow>
              See programmes
            </Button>
            <Button href="#request" variant="light">
              Request a place
            </Button>
          </>
        }
      />

      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Who it is for"
              index={1}
              title={
                <>
                  Two audiences, <em>one standard of guidance</em>
                </>
              }
            />
          </Reveal>
          <ul className="mentor-audiences">
            {AUDIENCES.map(({ title, Icon, lead, points }, i) => (
              <Reveal as="li" key={title} delay={i * 0.1} className="mentor-audience">
                <span className="mentor-audience__icon" aria-hidden="true">
                  <Icon size={26} stroke={1.5} />
                </span>
                <h3 className="mentor-audience__title">{title}</h3>
                <p className="mentor-audience__lead">{lead}</p>
                <ul className="mentor-audience__points">
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ink">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="How it works"
              index={2}
              title={
                <>
                  From first message to <em>measurable progress</em>
                </>
              }
            />
          </Reveal>
          <ol className="mentor-steps">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.08} className="mentor-steps__item">
                <span className="mentor-steps__index" aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <h3 className="mentor-steps__title">{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="paper-2" id="programs">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Programmes"
              index={3}
              title={
                <>
                  Choose the programme <em>that fits</em>
                </>
              }
              lead="Standard programmes support individuals; Premium programmes support employers and their specialists."
            />
          </Reveal>
          {/* Programme names, tiers, features and PRICES are admin-editable data from
              GET /mentorship/programs. Nothing here is hardcoded; a null price renders "Contact us". */}
          <QueryBoundary
            query={programsQuery}
            loading={<CardSkeletons count={2} height={460} />}
            errorTitle="We could not load the programmes"
            empty={<EmptyState title="Programmes are being finalised" description="Use the form below and we will recommend the right mentor for you." />}
          >
            {(programs) => <ProgramTabs programs={programs} onSelect={choose} />}
          </QueryBoundary>
        </Container>
      </Section>

      <Section tone="paper" id="request" aria-labelledby="request-title">
        <Container className="mentor-request">
          <Reveal className="mentor-request__intro">
            <Eyebrow index={4}>Get started</Eyebrow>
            <h2 id="request-title" className="mentor-request__title">
              Request <em>mentorship</em>
            </h2>
            <p>Tell us a little about you and your goal. We read every request and reply within two business days.</p>
            <ul className="mentor-request__next">
              <li>We review your goal and suggest the best programme.</li>
              <li>We introduce you to a mentor and agree a start date.</li>
              <li>No commitment until you are happy with the plan.</li>
            </ul>
          </Reveal>
          <Reveal className="mentor-request__form" delay={0.1}>
            <RequestForm form={form} programsQuery={programsQuery} />
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper-2" aria-labelledby="mentor-faq">
        <Container className="about-faq">
          <Reveal className="about-faq__intro">
            <Eyebrow index={5}>Questions</Eyebrow>
            <h2 id="mentor-faq" className="about-title">
              Before you <em>apply</em>
            </h2>
            <p className="about-prose">More questions about mentorship or working with us? We are happy to talk.</p>
            <Button to="/contact?type=mentorship" variant="secondary" arrow>
              Ask us directly
            </Button>
          </Reveal>
          <FaqList group="candidates" />
        </Container>
      </Section>
    </>
  );
}
