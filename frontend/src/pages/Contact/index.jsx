import { Link, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@mantine/core';
import { IconArrowUpRight, IconBrandLinkedin, IconBrandX, IconBrandFacebook, IconBrandInstagram, IconClock, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { Container, ErrorState, PageHero, Reveal, Section, Seo } from '@/components/ui';
import { telHref, useSettings } from '@/hooks/useSettings';
import { ContactForm } from './ContactForm';
import { resolveInquiryType } from './schema';

const SOCIALS = [
  { key: 'linkedin', label: 'LinkedIn', Icon: IconBrandLinkedin },
  { key: 'x', label: 'X', Icon: IconBrandX },
  { key: 'facebook', label: 'Facebook', Icon: IconBrandFacebook },
  { key: 'instagram', label: 'Instagram', Icon: IconBrandInstagram },
];

/** Contact details are rendered from /settings only; nothing is hardcoded here. */
function ContactDetails() {
  const { settings, isPending, isError, refetch } = useSettings();
  const { contact, social } = settings;

  if (isPending) {
    return (
      <div className="contact-cards" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={96} radius="lg" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState title="We could not load our contact details" onRetry={() => refetch()} />;

  const hasHours = contact.hours?.length > 0;
  const hasAddress = contact.address_lines?.length > 0;
  const socials = SOCIALS.filter(({ key }) => social?.[key]);

  return (
    <div className="contact-cards">
      {contact.email && (
        <div className="contact-card">
          <IconMail className="contact-card__icon" size={22} stroke={1.5} aria-hidden="true" />
          <h3 className="contact-card__label">Email</h3>
          <a className="contact-card__value contact-card__value--link" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
      )}
      {contact.phone && (
        <div className="contact-card">
          <IconPhone className="contact-card__icon" size={22} stroke={1.5} aria-hidden="true" />
          <h3 className="contact-card__label">Phone</h3>
          <a className="contact-card__value contact-card__value--link" href={telHref(contact.phone)}>
            {contact.phone}
          </a>
        </div>
      )}
      {hasAddress && (
        <div className="contact-card">
          <IconMapPin className="contact-card__icon" size={22} stroke={1.5} aria-hidden="true" />
          <h3 className="contact-card__label">Office</h3>
          <address className="contact-card__value">
            {contact.address_lines.map((line) => (
              <span key={line} className="contact-card__line">
                {line}
              </span>
            ))}
          </address>
          {contact.map_url && (
            <a className="contact-card__more" href={contact.map_url} target="_blank" rel="noopener noreferrer">
              Open in maps <IconArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
      {hasHours && (
        <div className="contact-card">
          <IconClock className="contact-card__icon" size={22} stroke={1.5} aria-hidden="true" />
          <h3 className="contact-card__label">Hours</h3>
          <dl className="contact-hours">
            {contact.hours.map((slot) => (
              <div key={slot.days} className="contact-hours__row">
                <dt>{slot.days}</dt>
                <dd>{slot.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {socials.length > 0 && (
        <ul className="contact-social" aria-label="Social profiles">
          {socials.map(({ key, label, Icon }) => (
            <li key={key}>
              <a className="contact-social__link" href={social[key]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <Icon size={20} stroke={1.5} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Contact() {
  const [params] = useSearchParams();
  const type = resolveInquiryType(params.get('type'));

  return (
    <>
      <Seo
        title="Contact"
        description="Talk to the DIGIT-B team about hiring retail supply-chain technology talent, your next role, mentorship or partnerships."
        path="/contact"
      />
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let’s start a <em>conversation</em>
          </>
        }
        lead="Hiring, job hunting or just curious? Tell us a little and the right person will reply by email."
        crumbs={[{ label: 'Contact' }]}
        seed="contact"
      />

      <Section tone="paper" className="contact">
        <Container>
          <div className="contact__layout">
            <Reveal as="div" className="contact__side">
              <h2 className="contact__heading">Get in touch</h2>
              <ContactDetails />

              <div className="contact-shortcuts">
                <Link to="/apply" className="contact-shortcut">
                  <span className="contact-shortcut__text">
                    <strong>Looking for a job?</strong>
                    <span>Send your CV and apply</span>
                  </span>
                  <IconArrowUpRight size={20} aria-hidden="true" />
                </Link>
                <Link to="/contact?type=hiring" className="contact-shortcut">
                  <span className="contact-shortcut__text">
                    <strong>Need to hire?</strong>
                    <span>Place a job order</span>
                  </span>
                  <IconArrowUpRight size={20} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            <Reveal as="div" delay={0.1} className="contact__form-wrap">
              <h2 className="contact__heading">Send us a message</h2>
              <ContactForm initialType={type} />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
