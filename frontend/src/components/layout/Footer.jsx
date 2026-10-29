import { Link } from 'react-router-dom';
import { IconBrandFacebook, IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { Logo } from '@/components/ui/Logo';
import { BinaryTicker } from '@/components/ui/BinaryTicker';
import { BitText } from '@/components/ui/BitText';
import { NewsletterForm } from './NewsletterForm';
import { footerNav, legalNav } from '@/config/nav';
import { telHref, useSettings } from '@/hooks/useSettings';

const SOCIALS = [
  { key: 'linkedin', label: 'LinkedIn', Icon: IconBrandLinkedin },
  { key: 'x', label: 'X (Twitter)', Icon: IconBrandX },
  { key: 'facebook', label: 'Facebook', Icon: IconBrandFacebook },
  { key: 'instagram', label: 'Instagram', Icon: IconBrandInstagram },
];

export function Footer() {
  const { settings } = useSettings();
  const { company, contact, social } = settings;
  const year = new Date().getFullYear();
  const socials = SOCIALS.filter(({ key }) => social?.[key]);

  return (
    <footer className="footer is-dark" data-surface="dark">
      <BinaryTicker className="footer__ticker" />

      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo tone="light" />
          <p className="footer__tagline">
            <BitText>{company.tagline || 'Moving beyond 0 and 1 to B-coming digital.'}</BitText>
          </p>
          <p className="footer__about">{company.description}</p>

          <div className="footer__newsletter">
            <h2 className="footer__heading">Hiring insights, monthly</h2>
            <NewsletterForm id="footer-newsletter" />
          </div>
        </div>

        {footerNav.map((group) => (
          <nav key={group.title} className="footer__col" aria-label={group.title}>
            <h2 className="footer__heading">{group.title}</h2>
            <ul className="footer__list">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <address className="footer__col footer__contact">
          <h2 className="footer__heading">Get in touch</h2>
          <ul className="footer__list">
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="footer__link footer__link--icon">
                  <IconMail size={18} aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            )}
            {contact.phone && (
              <li>
                <a href={telHref(contact.phone)} className="footer__link footer__link--icon">
                  <IconPhone size={18} aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.address_lines?.length > 0 && (
              <li className="footer__link footer__link--icon">
                <IconMapPin size={18} aria-hidden="true" />
                <span>{contact.address_lines.join(', ')}</span>
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <ul className="footer__socials" aria-label="Social media">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a href={social[key]} className="footer__social" target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={20} stroke={1.5} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </address>
      </div>

      <div className="container footer__bar">
        <p>
          © {year} {company.name || 'DIGIT-B'}. All rights reserved.
        </p>
        <ul className="footer__legal">
          {legalNav.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="footer__link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
