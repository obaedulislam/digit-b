import { Button, Container, Reveal, Section } from '@/components/ui';

/** Closing band on the job pages: speculative application + hiring shortcut. */
export function JobsCta({ title, text }) {
  return (
    <Section tone="ink" className="jobs-cta">
      <Container className="jobs-cta__inner">
        <Reveal className="jobs-cta__copy">
          <h2 className="jobs-cta__title">
            {title ?? (
              <>
                Not seeing <em>your</em> role?
              </>
            )}
          </h2>
          <p className="jobs-cta__text">
            {text ??
              'Many of our placements are never advertised. Share your CV and we will reach out when a match appears. Hiring instead? Tell us what you need.'}
          </p>
        </Reveal>
        <div className="jobs-cta__actions">
          <Button to="/apply" variant="accent" arrow>
            Apply now
          </Button>
          <Button to="/contact?type=hiring" variant="light">
            Place a job order
          </Button>
        </div>
      </Container>
    </Section>
  );
}
