import { Link } from 'react-router-dom';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Reveal } from './Reveal';
import { renderServiceIcon } from '@/lib/icons';
import { pad2 } from '@/lib/format';

/** One service as a whole-card link to /services/:slug. */
export function ServiceCard({ service, index }) {
  return (
    <Link to={`/services/${service.slug}`} className="service-card">
      <span className="service-card__top">
        <span className="service-card__icon" aria-hidden="true">
          {renderServiceIcon(service.icon, { size: 26, stroke: 1.5 })}
        </span>
        {index !== undefined && (
          <span className="service-card__index" aria-hidden="true">
            {pad2(index + 1)}
          </span>
        )}
      </span>
      <h3 className="service-card__title">{service.title}</h3>
      <p className="service-card__summary">{service.summary}</p>
      <span className="service-card__more">
        Explore
        <IconArrowUpRight size={18} aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Responsive list of ServiceCards with a staggered reveal. */
export function ServiceGrid({ services, className }) {
  return (
    <ul className={className ? `service-grid ${className}` : 'service-grid'}>
      {services.map((service, i) => (
        <Reveal as="li" key={service.id ?? service.slug} delay={(i % 3) * 0.08} className="service-grid__item">
          <ServiceCard service={service} index={i} />
        </Reveal>
      ))}
    </ul>
  );
}
