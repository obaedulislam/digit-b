import { Tabs } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { Badge } from './Layout';
import { Button } from './Button';
import { EmptyState } from './States';
import { Reveal } from './Reveal';
import { splitPrice } from '@/lib/price';

const TIERS = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

const AUDIENCE_LABEL = { individuals: 'For individuals', employers: 'For employers' };

/** A single programme / price card. Provide `to` (link) or `onSelect` (button). */
export function ProgramCard({ program, to, onSelect }) {
  const price = splitPrice(program.price);
  const label = program.cta_label || 'Get started';
  const action = to ? { to } : { onClick: () => onSelect?.(program) };

  return (
    <article className={program.is_featured ? 'program-card program-card--featured' : 'program-card'}>
      <header className="program-card__head">
        <div className="program-card__badges">
          {program.audience && <Badge tone="soft">{AUDIENCE_LABEL[program.audience] ?? program.audience}</Badge>}
          {program.is_featured && <Badge tone="accent">Most popular</Badge>}
        </div>
        <h3 className="program-card__name">{program.name}</h3>
        <p className="program-card__summary">{program.summary}</p>
      </header>

      <p className="program-card__price">
        {price ? (
          <>
            <span className="program-card__figure">{price.figure}</span>
            {price.unit && <span className="program-card__unit">{price.unit}</span>}
          </>
        ) : (
          <span className="program-card__figure program-card__figure--text">Contact us</span>
        )}
      </p>

      {program.features?.length > 0 && (
        <ul className="program-card__features">
          {program.features.map((feature) => (
            <li key={feature}>
              <IconCheck size={18} stroke={2.25} aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <Button variant={program.is_featured ? 'accent' : 'primary'} arrow block {...action}>
        {label}
        <span className="sr-only"> — {program.name}</span>
      </Button>
    </article>
  );
}

/**
 * Standard / Premium tabs of programme cards.
 * `getHref(program)` makes the buttons links; otherwise `onSelect(program)` is called.
 */
export function ProgramTabs({ programs, getHref, onSelect }) {
  const byTier = (tier) => programs.filter((p) => p.tier === tier);
  const first = TIERS.find((t) => byTier(t.value).length) ?? TIERS[0];

  return (
    <Tabs defaultValue={first.value} keepMounted={false} activateTabWithKeyboard>
      <Tabs.List aria-label="Programme tier">
        {TIERS.map((tier) => (
          <Tabs.Tab key={tier.value} value={tier.value}>
            {tier.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {TIERS.map((tier) => {
        const items = byTier(tier.value);
        return (
          <Tabs.Panel key={tier.value} value={tier.value}>
            {items.length ? (
              <ul className="program-grid">
                {items.map((program, i) => (
                  <Reveal as="li" key={program.id ?? program.slug} delay={i * 0.08}>
                    <ProgramCard program={program} to={getHref?.(program)} onSelect={onSelect} />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <EmptyState title={`No ${tier.label} programmes right now`} description="Please check the other tier, or contact us about a bespoke plan." />
            )}
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}
