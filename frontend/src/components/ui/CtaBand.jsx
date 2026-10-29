import { Container, Eyebrow, Section } from './Layout';
import { NodeField } from './NodeField';
import { Reveal } from './Reveal';

/**
 * Closing call-to-action: a rounded ink panel with generative art, sitting on
 * a paper section so it never fuses with the (ink) footer below it.
 * `actions` = <Button/> elements.
 */
export function CtaBand({ eyebrow, title, lead, actions, tone = 'paper', seed = 'cta-band' }) {
  return (
    <Section tone={tone} className="cta-section">
      <Container>
        <Reveal className="cta-band is-dark" data-surface="dark">
          <NodeField seed={seed} nodes={24} packets={3} className="cta-band__art" />
          <div className="cta-band__body">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2 className="cta-band__title">{title}</h2>
            {lead && <p className="cta-band__lead">{lead}</p>}
          </div>
          {actions && <div className="cta-band__actions">{actions}</div>}
        </Reveal>
      </Container>
    </Section>
  );
}
