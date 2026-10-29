import { Container, Section } from './Layout';
import { Reveal } from './Reveal';
import { useSettings } from '@/hooks/useSettings';

/**
 * Headline numbers from `settings.stats` (admin-editable). Renders nothing when
 * there are none, so it never shows placeholder figures.
 */
export function StatsBand({ tone = 'paper', label = 'DIGIT-B in numbers' }) {
  const { settings } = useSettings();
  const stats = settings.stats ?? [];
  if (!stats.length) return null;

  return (
    <Section tone={tone} className="stats-section" aria-label={label}>
      <Container>
        <ul className="stats-band">
          {stats.map((stat, i) => (
            <Reveal as="li" key={`${stat.label}-${i}`} delay={i * 0.07} className="stats-band__item">
              <span className="stats-band__value">{stat.value}</span>
              <span className="stats-band__label">{stat.label}</span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
