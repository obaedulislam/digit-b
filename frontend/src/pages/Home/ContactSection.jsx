import { Skeleton } from '@mantine/core';
import { IconClock, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { Container, ErrorState, Reveal, Section, SectionHeader } from '@/components/ui';
import { telHref, useSettings } from '@/hooks/useSettings';
import { QuickContactForm } from './QuickContactForm';

function ContactCard({ icon: Icon, label, children }) {
  return (
    <li className="home-contact__card">
      <span className="home-contact__icon" aria-hidden="true">
        <Icon size={22} stroke={1.5} />
      </span>
      <h3 className="home-contact__label">{label}</h3>
      <div className="home-contact__value">{children}</div>
    </li>
  );
}

function ContactCards() {
  const { settings, isPending, isError, refetch } = useSettings();
  const { email, phone, address_lines: address = [], hours = [] } = settings.contact;

  if (isPending) {
    return (
      <div className="home-contact__cards" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={150} radius="lg" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState title="We could not load our contact details" onRetry={refetch} />;

  return (
    <ul className="home-contact__cards">
      {address.length > 0 && (
        <ContactCard icon={IconMapPin} label="Visit">
          <address>
            {address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        </ContactCard>
      )}
      {phone && (
        <ContactCard icon={IconPhone} label="Call">
          <a href={telHref(phone)}>{phone}</a>
        </ContactCard>
      )}
      {email && (
        <ContactCard icon={IconMail} label="Write">
          <a href={`mailto:${email}`}>{email}</a>
        </ContactCard>
      )}
      {hours.length > 0 && (
        <ContactCard icon={IconClock} label="Hours">
          {hours.map((row) => (
            <span key={row.days}>
              {row.days}: {row.time}
            </span>
          ))}
        </ContactCard>
      )}
    </ul>
  );
}

export function ContactSection() {
  return (
    <Section tone="ink" id="contact">
      <Container className="home-contact">
        <Reveal className="home-contact__intro">
          <SectionHeader
            eyebrow="Get in touch"
            index={8}
            title={
              <>
                It&rsquo;s your <em>turn</em>
              </>
            }
            lead="Hiring a leader, looking for your next role or curious about mentorship? Reach us directly, or send a note and a recruiter will reply within one business day."
          />
          <ContactCards />
        </Reveal>

        <Reveal className="home-contact__form" delay={0.1}>
          <h3 className="home-contact__form-title">What are you looking for?</h3>
          <QuickContactForm />
        </Reveal>
      </Container>
    </Section>
  );
}
